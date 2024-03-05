import { Mesh, Object3D, Raycaster } from 'three'
import { ClampVector2, Direction } from '../models/Coordinate'
import { ObjectScript } from '../types'
import { AnimationModel } from '../models/AnimationModel'
import { Input } from '../models/Input'
import { JoyStick } from '../libs/JoyStick'

export interface PlayerControllerOptions {
  speed: number
  rotateSpeed: number
  turnBack: boolean
}

export class PlayerController extends ObjectScript {
  controller: Controller
  speed: number
  rotateSpeed: number
  turnBack: boolean
  navMesh: Mesh | null = null
  raycaster: Raycaster
  animations?: AnimationModel
  playerMoved = false
  static DefaultOptions = {
    speed: 3,
    rotateSpeed: 1,
    turnBack: false
  }

  constructor(
    object: Object3D,
    animations?: AnimationModel,
    options?: Partial<PlayerControllerOptions>
  ) {
    super(object)
    this.controller =
      'touchstart' in document.documentElement
        ? new ScreenController()
        : new KeyboardController()
    this.raycaster = new Raycaster()
    this.animations = animations
    const mergedOptions = {
      ...PlayerController.DefaultOptions,
      ...(options || {})
    }
    this.speed = mergedOptions.speed
    this.rotateSpeed = mergedOptions.rotateSpeed
    this.turnBack = mergedOptions.turnBack
  }

  render(time: number, dt: number) {
    this.controller.update()
    const move = this.controller.move
    this.playerMoved = false
    // 判断是否可以前进后退
    if (Math.abs(move.up) > 0) {
      if (move.up < 0 && this.turnBack && !this.controller.turned) {
        this.object.rotateY(Math.PI)
        this.controller.turned = true
      } else if (move.up > 0) {
        this.controller.turned = false
      }
      // 需要根据角色的朝向来确定前进的方向
      const forward = Direction.forward
        .clone()
        .applyQuaternion(this.object.quaternion)
      // 获取前进后的坐标是否还在 navMesh 上，通过射线检测
      const pos = this.object.position
        .clone()
        .add(
          forward.multiplyScalar(
            (move.up >= 1 ? this.speed : this.speed / Math.abs(move.up)) *
              dt *
              (this.controller.turned ? -1 : 1) *
              move.up
          )
        )
      pos.y += 10

      if (this.navMesh) {
        this.raycaster.set(pos, Direction.down)
        const intersects = this.raycaster.intersectObject(this.navMesh)
        if (intersects.length > 0) {
          this.object.position.copy(intersects[0].point)
          this.playerMoved = true
        }
      } else {
        pos.y = this.object.position.y
        this.object.position.copy(pos)
        this.playerMoved = true
      }
    }

    if (Math.abs(move.right) > 0) {
      this.object.rotateY(dt * this.rotateSpeed * -1 * move.right)
      this.playerMoved = true
    }
  }
}

/*
  主控属性，通过键盘、屏幕和手柄分别控制
*/
class Controller {
  move = new ClampVector2(0, 0, -1, 1)
  turned = false
  update() {}
}

/*
  控制键盘输入
*/
class KeyboardController extends Controller {
  input: Input
  keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    fire: false
  }
  constructor() {
    super()
    this.input = new Input(
      ['keydown', 'keyup', 'mousedown', 'mousemove', 'mouseup'],
      [this.keydown.bind(this), this.keyup.bind(this)]
    )
  }

  update() {
    // 有一个加速的过程
    if (this.keys.w) this.move.up += 0.1
    if (this.keys.s) this.move.up -= 0.1
    if (this.keys.a) this.move.right -= 0.1
    if (this.keys.d) this.move.right += 0.1
    if (!this.keys.a && !this.keys.d) this.move.right = 0
    if (!this.keys.w && !this.keys.s) {
      this.move.up = 0
      this.turned = false
    }
  }

  get hasKeys() {
    return Object.values(this.keys).some((v) => v)
  }

  keydown(evt: Event) {
    let { key } = evt as KeyboardEvent
    key = key === ' ' ? 'fire' : key
    if (Reflect.has(this.keys, key)) Reflect.set(this.keys, key, true)
  }
  keyup(evt: Event) {
    let { key } = evt as KeyboardEvent
    key = key === ' ' ? 'fire' : key
    if (Reflect.has(this.keys, key)) Reflect.set(this.keys, key, false)
  }
}

/*
  控制屏幕输入
*/
class ScreenController extends Controller {
  constructor() {
    super()
    new JoyStick({
      left: true,
      onMove: this.onJoyStickMove.bind(this)
    })
  }

  onJoyStickMove(forward: number, turn: number) {
    this.move.up = forward
    this.move.right = turn
  }

  update() {}
}

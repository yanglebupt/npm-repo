import { Box3, Box3Helper, Object3D, Scene } from 'three'
import { ObjectScript } from './Script'

/**
 * 根据包围盒实现的碰撞器，注意包围盒的更新
 */
export class ColliderScript extends ObjectScript {
  enter = false
  stay = false
  exit = false
  freeze = false
  private box: Box3 | null = null
  public boxHelper: Box3Helper | null = null

  created() {
    this.createBox()
  }

  helper(scene: Scene) {
    scene.add(this.boxHelper!)
  }

  render(time: number, dt?: number) {
    this.updateBox()
  }

  // 开启关闭包围盒
  turnBoxHelper(open: boolean = false) {
    this.boxHelper!.visible = open
  }

  // 清除包围盒
  removeBoxHelper() {
    this.boxHelper!.removeFromParent()
  }

  createBox() {
    this.box = new Box3().setFromObject(this.object)
    this.boxHelper = new Box3Helper(this.box)
    this.boxHelper.name = `${this.object.name}-box-helper`
  }

  updateBox() {
    if (!this.box) return
    this.box.setFromObject(this.object)
  }

  intersects(object?: Object3D | null): void
  intersects(object?: ColliderScript | null): void
  intersects(collider?: ColliderScript | Object3D | null) {
    if (!collider) return
    const colliderScript =
      collider instanceof Object3D
        ? collider.getScript<ColliderScript>(ColliderScript)
        : collider
    if (!this.box || !colliderScript || !colliderScript.box) return
    const flag = this.box.intersectsBox(colliderScript.box)
    if (!flag) {
      if (this.enter || this.stay) {
        this.enter = false
        this.stay = false
        this.exit = true
      } else {
        this.enter = false
        this.stay = false
        this.exit = false
      }
    } else {
      if (!this.enter && !this.stay) {
        this.enter = true
        this.stay = false
        this.exit = false
      } else {
        this.enter = false
        this.stay = true
        this.exit = false
      }
    }
  }

  triggerEnter() {
    return this.enter && !this.freeze
  }

  triggerStay() {
    return this.stay && !this.freeze
  }

  triggerExit() {
    return this.exit && !this.freeze
  }
}

/**
 * 标准实现的碰撞器
 */
export abstract class Collider extends ObjectScript {
  isTrigger: boolean
  constructor(object: Object3D, isTrigger: boolean) {
    super(object)
    this.isTrigger = isTrigger
    Reflect.set(this.object, this.isTrigger ? 'isTrigger' : 'isCollider', true)
  }

  onTriggerEnter(other: ColliderEvent) {}
  onTriggerStay(other: ColliderEvent) {}
  onTriggerExit(other: ColliderEvent) {}

  onCollisionEnter(other: ColliderEvent) {}
  onCollisionStay(other: ColliderEvent) {}
  onCollisionExit(other: ColliderEvent) {}

  abstract render(time: number): void
}

export class ColliderEvent {
  constructor() {}
}

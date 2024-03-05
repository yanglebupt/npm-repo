import { Box3, Material, Mesh, Object3D, Scene, Vector3 } from 'three'
import { cloneDeep } from 'lodash-es'

/**
 * 模型脚本基类，必须要有 render 方法进行更新
 */
export interface Script {
  render(time: number, dt?: number): void
}

/**
 * @description 模型脚本
 * @param {Object3D} object 脚本挂载的对象
 */
export abstract class ObjectScript implements Script {
  object: Object3D
  constructor(object: Object3D) {
    this.object = object
  }
  abstract render(time: number, dt?: number): void
  // 移动到目标位置
  moveToTarget(
    target: Vector3,
    dt: number,
    speed: number,
    turnDuration: number,
    esp = 1e-2
  ) {
    // 前进的方向
    const direction = target.clone().sub(this.object.position)
    let isComplete = direction.lengthSq() < esp
    if (!isComplete) {
      const preDis = this.object.position.distanceToSquared(target)
      direction.normalize()

      const prevQuaternion = this.object.quaternion.clone()
      this.object.lookAt(target)
      const nextQuaternion = this.object.quaternion.clone()
      // lookAt 后 还原，这步目标只是确定 前后四元数
      this.object.quaternion.copy(prevQuaternion)

      // 进行四元数插值
      this.object.quaternion.slerp(nextQuaternion, turnDuration)

      // dt 时间，前进 speed*dt 距离
      this.object.position.add(direction.multiplyScalar(speed * dt))

      const nextDis = this.object.position.distanceToSquared(target)
      // 这一个 dt 超过了，目标点
      isComplete = nextDis > preDis
    }
    return isComplete
  }
}

/**
 * 根据包围盒实现的 碰撞器，注意包围盒的更新
 */
export abstract class BoxCheckCollider extends ObjectScript {
  enter = false
  stay = false
  exit = false
  freeze = false

  abstract render(time: number): void

  createBoxFromScene(scene: Scene, name: string, group = true) {
    const object = scene.getObjectByName(name)
    if (object) {
      const box = this.createBox(object, group)
      return [object, box]
    } else {
      return [null, null]
    }
  }

  createBox(object: Object3D, group = true) {
    const mesh = group ? object.children[0] : object
    const box = new Box3().setFromObject(mesh)
    this.updateBox(object, box)
    return box
  }

  updateBox(object: Object3D, box: Box3, group = true) {
    const mesh = group ? object.children[0] : object
    box
      .copy((mesh as Mesh).geometry.boundingBox!)
      .applyMatrix4(mesh.matrixWorld)
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
 * 碰撞器
 */
export abstract class Collider extends ObjectScript {
  isTrigger: boolean
  constructor(object: Object3D, isTrigger: boolean) {
    super(object)
    this.isTrigger = isTrigger
    this.makeCollider()
  }

  private makeCollider() {
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

export class ScriptObject3D<T = Script> extends Object3D {
  static getScript<T = Script>(object: ScriptObject3D | Object3D) {
    return Reflect.get(object, 'script') as T
  }
  static dispose(object: ScriptObject3D | Object3D, group = false) {
    const mesh = group ? object.children[0] : object
    ;(mesh as Object3D as Mesh).geometry.dispose()
    ;((mesh as Object3D as Mesh).material as Material).dispose()
  }
}
// 为 Object3D 添加 脚本实例
export const createScriptObject3D = <T = Script>(
  object: Object3D,
  script: T | null
) => {
  Reflect.set(object, 'script', script)
  return object as ScriptObject3D<T>
}

// 不应该调用该方法，克隆脚本需要重新实例化脚本对象
export const cloneScriptObject3D = (
  object: ScriptObject3D,
  recursive?: boolean
) => {
  const _o = object.clone(recursive)
  Reflect.set(_o, 'script', cloneDeep(Reflect.get(object, 'script')))
  return _o
}

// export class Script2Object3D {
//   object: Object3D
//   script: Script | null
//   constructor(object: Object3D, script: Script | null) {
//     this.object = object
//     this.script = script
//     Reflect.set(object, 'script', script)
//     return object as unknown as Script2Object3D
//   }
// }

// export class ScriptObject3D {
//   object: Object3D
//   script: Script | null
//   constructor(object: Object3D, script: Script | null) {
//     this.object = object
//     this.script = script
//   }
//   clone() {
//     return new ScriptObject3D(this.object.clone(), this.script)
//   }
// }

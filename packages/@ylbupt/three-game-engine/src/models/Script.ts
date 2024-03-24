import { Object3D, Scene, Vector3 } from 'three'
import { v4 } from 'uuid'
import { InstanceModel } from './AnimationModel'

/**
 * 模型脚本基类，必须要有 render 方法进行更新
 */
export interface Script {
  awaked(): void
  created(): void
  render(time: number, dt?: number): void
  helper(scene?: Scene): void
  beforeDestroy(): void
}

export interface ObjectScriptOptions {}

/**
 * @description 模型脚本
 * @param {Object3D} object 脚本挂载的对象
 */
export abstract class ObjectScript<
  O extends ObjectScriptOptions = ObjectScriptOptions
> implements Script
{
  object: Object3D
  uuid: string
  options?: O
  constructor(object: Object3D)
  constructor(object: Object3D, options: O)
  constructor(object: Object3D, options?: O) {
    this.options = options
    this.object = object
    this.uuid = v4()
  }
  helper(scene?: Scene) {}
  awaked() {}
  created() {}
  render(time: number, dt?: number) {}
  beforeDestroy() {}
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

///////////////// 新增的 Script 方法原型 //////////////////////
export const ScriptCollection = Symbol('scripts')
export const ExtendModelCollection = Symbol('extendModel')

export class ScriptMethods {
  addScript<T extends ObjectScript<O>, O extends ObjectScriptOptions>(
    script: new (object: Object3D, options?: O) => T,
    options?: O
  ): T {
    const target = this as any
    const s = new script(target, options)
    let scriptCollection = Reflect.get(target, ScriptCollection)
    if (!scriptCollection) {
      scriptCollection = {}
      Reflect.set(target, ScriptCollection, scriptCollection)
    }
    Reflect.set(scriptCollection, script.name, s)
    return s
  }
  getScript<T extends ObjectScript>(
    script: new (object: Object3D) => T
  ): T | null {
    let scriptCollection = Reflect.get(this, ScriptCollection)
    if (!scriptCollection) {
      return null
    } else {
      return Reflect.get(scriptCollection, script.name) as T
    }
  }
  removeScript<T extends ObjectScript>(script: new (object: Object3D) => T) {
    let scriptCollection = Reflect.get(this, ScriptCollection)
    if (!scriptCollection) {
      return true
    } else {
      return Reflect.deleteProperty(scriptCollection, script.name)
    }
  }
  clearScript() {
    return Reflect.deleteProperty(this, ScriptCollection)
  }
}

Object.assign(
  Object3D.prototype,
  Reflect.ownKeys(ScriptMethods.prototype)
    .filter((k) => k != 'constructor')
    .reduce((pre: any, k) => {
      pre[k] = Reflect.get(ScriptMethods.prototype, k)
      return pre
    }, {})
)

const oldAdd = Object3D.prototype.add
Object3D.prototype.add = function (...object: (Object3D | InstanceModel)[]) {
  object.forEach((obj) => {
    if (obj instanceof InstanceModel) {
      let extendModelCollection = Reflect.get(
        this,
        ExtendModelCollection
      ) as InstanceModel[]
      if (!extendModelCollection) {
        extendModelCollection = []
        Reflect.set(this, ExtendModelCollection, extendModelCollection)
      }
      if (!extendModelCollection.includes(obj)) extendModelCollection.push(obj)
    } else if (obj instanceof Object3D) {
      oldAdd.call(this, obj)
    }
  })
  return this
}

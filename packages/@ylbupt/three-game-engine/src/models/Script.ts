import { Object3D, Scene, Vector3 } from 'three'
import { v4 } from 'uuid'
import { InstanceModel } from './AnimationModel'

/**
 * 模型脚本基类，必须要有 render 方法进行更新
 */
export interface Script {
  awaked(): void
  created(): void
  beforeRender(): void
  render(time: number, dt?: number): void
  helper(scene?: Scene): void
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
  beforeRender() {}
  awaked() {}
  created() {}
  render(time: number, dt?: number) {}
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

export const ScriptCollection = Symbol('scripts')

Object3D.prototype.getScriptTarget = function () {
  let target = this
  if (this instanceof InstanceModel) {
    const root = this.getRootObject()
    if (!root) throw new Error('Please load before add script')
    target = root
  }
  return target
}

Object3D.prototype.addScript = function <
  T extends ObjectScript<O>,
  O extends ObjectScriptOptions
>(script: new (object: Object3D, options?: O) => T, options?: O): T {
  const target = this.getScriptTarget()
  const s = new script(target, options)
  let scriptCollection = Reflect.get(target, ScriptCollection)
  if (!scriptCollection) {
    scriptCollection = {}
    Reflect.set(target, ScriptCollection, scriptCollection)
  }
  Reflect.set(scriptCollection, script.name, s)
  return s
}

Object3D.prototype.getScript = function <T extends ObjectScript>(
  script: new (object: Object3D) => T
): T | null {
  const target = this.getScriptTarget()
  let scriptCollection = Reflect.get(target, ScriptCollection)
  if (!scriptCollection) {
    return null
  } else {
    return Reflect.get(scriptCollection, script.name) as T
  }
}

Object3D.prototype.removeScript = function <T extends ObjectScript>(
  script: new (object: Object3D) => T
) {
  const target = this.getScriptTarget()
  let scriptCollection = Reflect.get(target, ScriptCollection)
  if (!scriptCollection) {
    return true
  } else {
    return Reflect.deleteProperty(scriptCollection, script.name)
  }
}

Object3D.prototype.clearScript = function () {
  const target = this.getScriptTarget()
  return Reflect.deleteProperty(target, ScriptCollection)
}

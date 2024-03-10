import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Box3,
  Box3Helper,
  Group,
  LoadingManager,
  Object3D,
  Scene
} from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { LoadGLTFOptions, loadGLTFModel } from '../tools/loader'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils'
import { ScriptCollection, ScriptMethods } from './Script'

/**
 * @param {GLTF} model gltf 模型
 * @param {LoadingManager} loadingManager 模型加载进度管理器
 * @param {string} path 模型地址
 * @method load 加载模型
 */
export interface InstanceModel extends Group {}
export class InstanceModel {
  model: GLTF | Partial<GLTF> | null = null
  loadingManager: LoadingManager
  path: string
  name: string
  needBox: boolean
  box: Box3 | null = null
  boxHelper: Box3Helper | null = null
  options?: LoadGLTFOptions

  static createFromGLTF<T extends InstanceModel>(
    constructor: new (
      path: string,
      name: string,
      needBox?: boolean,
      loadingManager?: LoadingManager
    ) => T,
    gltf: Partial<GLTF>,
    name: string,
    needBox = false
  ): T {
    const model = new constructor('', name, needBox)
    model.load(gltf)
    return model
  }

  constructor(
    path: string,
    name: string,
    needBox = false,
    loadingManager?: LoadingManager,
    options?: LoadGLTFOptions
  ) {
    this.path = path
    this.name = name
    this.needBox = needBox
    this.loadingManager = loadingManager ?? new LoadingManager()
    this.options = options
    Object.setPrototypeOf(this.getPrototype(), new ScriptMethods())
  }

  load(): Promise<void>
  load(model: Partial<GLTF>): Promise<void>
  async load(model?: Partial<GLTF>) {
    this.model =
      model ??
      (await loadGLTFModel(this.path, true, this.loadingManager, this.options))
    if (this.needBox) this.makeBox(this.getRootObject())
    if (this.name) this.getRootObject()!.name = this.name
    const target = this.getRootObject()!
    Object.setPrototypeOf(this.getPrototype(), target)
    Reflect.set(target, ScriptCollection, Reflect.get(this, ScriptCollection))
    Reflect.deleteProperty(this, ScriptCollection)
  }

  getPrototype() {
    const proto = Object.getPrototypeOf(this)
    const proto_proto = Object.getPrototypeOf(proto)
    return Object.getPrototypeOf(proto_proto) === null ? proto : proto_proto
  }

  getRootObject() {
    return this.model?.scene
  }

  // 制作包围盒，已经存在则返回
  makeBox(object: Object3D | null | undefined) {
    if (!object || this.box) return
    // 添加包围盒
    this.box = new Box3().setFromObject(object)
    this.boxHelper = new Box3Helper(this.box)
    this.boxHelper.name = `${this.name}-box`
    object.add(this.boxHelper)
  }

  // 开启关闭包围盒
  turnBoxHelper(open: boolean = false) {
    if (!this.boxHelper) return
    this.boxHelper.visible = open
  }

  // 清除包围盒
  removeBoxHelper() {
    this.boxHelper?.removeFromParent()
  }
}

/**
 * @param {GLTF} model gltf 模型
 * @param {AnimationMixer} mixer 模型动画混合器
 * @param {Object} namedAnimationClip 使用 {name:clip}
 * @param {boolean} loaded 是否加载完成
 * @param {string[]} actionNames 所有的 clips 的 name 数组
 * @param {number} actionIndex 设置播放 clip 的索引
 * @method load 加载模型
 * @method getAction(actionName:string) 根据动画名获取动画
 * @method setSpeed 设置动画播放速度
 * @method loopAllActions 循环播放所有动画
 */
export class AnimationModel extends InstanceModel {
  mixer: AnimationMixer | null = null
  namedAnimationClip = {}
  loaded: boolean = false
  actionNames: string[] = []

  private _actionIndex: number = -1
  private _action: AnimationAction | null = null

  constructor(
    path: string,
    name: string,
    needBox = false,
    loadingManager?: LoadingManager,
    options?: LoadGLTFOptions
  ) {
    super(path, name, needBox, loadingManager, options)
  }

  render(time: number, dt: number) {
    this.mixer?.update(dt)
  }

  load(): Promise<void>
  load(model: Partial<GLTF>): Promise<void>
  async load(model?: Partial<GLTF>) {
    model ? super.load(model) : await super.load()
    this.initAnimations()
  }

  private initAnimations() {
    this.mixer = new AnimationMixer(this.getRootObject()!)
    this.model!.animations?.forEach((clip) =>
      Reflect.set(this.namedAnimationClip, clip.name, clip)
    )
    this.actionNames = Object.keys(this.namedAnimationClip)
    this.loaded = true
  }

  getAction(actionName: string) {
    if (!this.mixer) return null
    const clip = Reflect.get(
      this.namedAnimationClip,
      actionName
    ) as AnimationClip
    if (!clip) return null
    return this.mixer.clipAction(clip)
  }

  setSpeed(timeScale: number) {
    if (this.mixer) this.mixer!.timeScale = timeScale
  }

  loopAllActions(delay: number) {
    setInterval(() => {
      this.actionIndex = (this.actionIndex + 1) % this.actionNames.length
    }, delay)
  }

  set actionIndex(index: number) {
    if (index === this.actionIndex) return
    this._actionIndex = index
    const action = this.getAction(this.actionNames[index])
    if (!action) return
    action?.reset().play()
    if (this._action) {
      this._action.crossFadeTo(action, 0.5, false)
    }
    this._action = action
  }

  get actionIndex() {
    return this._actionIndex
  }

  get actionName() {
    return this.actionNames[this._actionIndex]
  }
}

export function cloneGLTF(
  gltf: Partial<GLTF>,
  isAnimationSkin = true,
  deleteObjectNames?: string[] | string
): Partial<GLTF> {
  const deletedNames = Array.isArray(deleteObjectNames)
    ? deleteObjectNames
    : [deleteObjectNames]

  const cloned = {
    animations: gltf.animations,
    scene: isAnimationSkin
      ? (clone(gltf.scene!) as Group)
      : gltf.scene?.clone(true)
  }

  if (deleteObjectNames)
    // 删除一些不需要克隆的物体
    (deletedNames as string[]).forEach((name) =>
      cloned.scene?.getObjectByName(name)?.removeFromParent()
    )

  return cloned
}

// 包括骨骼的克隆
// export function cloneGLTF(
//   gltf: Partial<GLTF>,
//   isAnimationSkin = true,
//   deleteObjectNames?: string[] | string
// ): Partial<GLTF> {
//   const deletedNames = Array.isArray(deleteObjectNames)
//     ? deleteObjectNames
//     : [deleteObjectNames]

//   const clone = isAnimationSkin
//     ? {
//         animations: gltf.animations,
//         scene: gltf.scene?.clone(true)
//       }
//     : { scene: gltf.scene?.clone(true) }

//   if (deleteObjectNames)
//     // 删除一些不需要克隆的物体
//     (deletedNames as string[]).forEach((name) =>
//       clone.scene?.getObjectByName(name)?.removeFromParent()
//     )

//   if (!isAnimationSkin) return clone

//   const skinnedMeshes: any = {}

//   gltf.scene?.traverse((node: any) => {
//     if (node.isSkinnedMesh) {
//       skinnedMeshes[node.name] = node
//     }
//   })

//   const cloneBones: any = {}
//   const cloneSkinnedMeshes: any = {}

//   clone.scene?.traverse((node: any) => {
//     if (node.isBone) {
//       cloneBones[node.name] = node
//     }
//     if (node.isSkinnedMesh) {
//       cloneSkinnedMeshes[node.name] = node
//     }
//   })

//   for (let name in skinnedMeshes) {
//     const skinnedMesh = skinnedMeshes[name]
//     const skeleton = skinnedMesh.skeleton
//     const cloneSkinnedMesh = cloneSkinnedMeshes[name]
//     const orderedCloneBones = []
//     for (let i = 0; i < skeleton.bones.length; ++i) {
//       const cloneBone = cloneBones[skeleton.bones[i].name]
//       orderedCloneBones.push(cloneBone)
//     }
//     cloneSkinnedMesh.bind(
//       new Skeleton(orderedCloneBones, skeleton.boneInverses),
//       cloneSkinnedMesh.matrixWorld
//     )
//   }

//   return clone
// }

// 从一个已经存在的模型，克隆模型
export function cloneModel<T extends InstanceModel = InstanceModel>(
  model: T,
  name: string,
  needBox = false
): T {
  const isAnimationModel = model instanceof AnimationModel
  // 包围盒不能 clone
  const clonedModel = InstanceModel.createFromGLTF(
    isAnimationModel ? AnimationModel : InstanceModel,
    cloneGLTF(model.model!, isAnimationModel, model.boxHelper?.name),
    name,
    needBox
  ) as T
  return clonedModel
}

export function ProxyInstanceModel<T extends InstanceModel>(model: T) {
  const root = model.getRootObject()!
  // return new Proxy(model, {
  //   get(target: T, p: string) {
  //     return WrapAttributeAndMethod(
  //       Object.hasOwn(target, p) ? target : root,
  //       p,
  //       root
  //     )
  //   }
  // })
  Object.setPrototypeOf(model, root)
  return model
}

export function WrapAttributeAndMethod(
  target: object,
  p: string,
  binding: object
) {
  const v = Reflect.get(target, p)
  return v && v.bind ? v.bind(binding) : v
}

import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Box3,
  Box3Helper,
  Group,
  LoadingManager,
  Object3D,
  Skeleton
} from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { loadGLTFModel } from '../tools/loader'

/**
 * @param {GLTF} model gltf 模型
 * @param {LoadingManager} manager 模型加载进度管理器
 * @param {string} path 模型地址
 * @method load 加载模型
 * @method setManager 设置另外的进度管理器
 */
class InstanceModel {
  model: GLTF | null = null
  manager: LoadingManager = new LoadingManager()
  path: string
  name: string
  needBox: boolean
  box: Box3 | null = null

  constructor(path: string, name: string, needBox = false) {
    this.path = path
    this.name = name
    this.needBox = needBox
  }

  async load() {
    const model = await loadGLTFModel(this.path, true, this.manager)
    this.model = model
    if (this.needBox) this.makeBox(this.getRootObject())
    if (this.name) this.getRootObject()!.name = this.name
  }

  setManager(manager: LoadingManager) {
    this.manager = manager
  }

  getRootObject() {
    return this.model?.scene
  }

  makeBox(object: Object3D | null | undefined) {
    if (!object) return
    // 添加包围盒
    const box = new Box3().setFromObject(object)
    this.box = box
    const boxHelper = new Box3Helper(box)
    boxHelper.name = `${this.name}-box`
    object.add(boxHelper)
  }
}

class CloneInstanceModel<T = InstanceModel> {
  model: InstanceModel
  needBox: boolean
  name: string
  cloneGLTF: boolean
  rootObject: Group | null | undefined = null

  constructor(
    model: InstanceModel,
    name = '',
    needBox = false,
    cloneGLTF = false
  ) {
    this.model = model
    this.needBox = needBox
    this.name = name
    this.cloneGLTF = cloneGLTF
    if (this.cloneGLTF) {
      this.model = AnimationModel.createAnimationModel(
        this._cloneGLTF(this.model.model!)
      )
    }
  }

  // 方便获取场景，可以直接
  getRootObject() {
    if (!this.rootObject) {
      const cloneObject = this.cloneGLTF
        ? this.model.getRootObject()
        : this.model.getRootObject()!.clone(true)
      cloneObject!.name = this.name
      if (this.needBox) this.model.makeBox(cloneObject)
      this.rootObject = cloneObject
    }
    return this.rootObject
  }

  // 想要获取其他属性（例如动画），必须先获取内层属性 model 拿到实例对象
  getClonedModel() {
    return this.model as T
  }

  // 包括骨骼的克隆
  _cloneGLTF(gltf: GLTF) {
    const clone = {
      animations: gltf.animations,
      scene: gltf.scene.clone(true)
    }

    const skinnedMeshes: any = {}

    gltf.scene.traverse((node: any) => {
      if (node.isSkinnedMesh) {
        skinnedMeshes[node.name] = node
      }
    })

    const cloneBones: any = {}
    const cloneSkinnedMeshes: any = {}

    clone.scene.traverse((node: any) => {
      if (node.isBone) {
        cloneBones[node.name] = node
      }
      if (node.isSkinnedMesh) {
        cloneSkinnedMeshes[node.name] = node
      }
    })

    for (let name in skinnedMeshes) {
      const skinnedMesh = skinnedMeshes[name]
      const skeleton = skinnedMesh.skeleton
      const cloneSkinnedMesh = cloneSkinnedMeshes[name]
      const orderedCloneBones = []
      for (let i = 0; i < skeleton.bones.length; ++i) {
        const cloneBone = cloneBones[skeleton.bones[i].name]
        orderedCloneBones.push(cloneBone)
      }
      cloneSkinnedMesh.bind(
        new Skeleton(orderedCloneBones, skeleton.boneInverses),
        cloneSkinnedMesh.matrixWorld
      )
    }
    return clone
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
class AnimationModel extends InstanceModel {
  model: GLTF | null = null
  mixer: AnimationMixer | null = null
  namedAnimationClip = {}
  loaded: boolean = false
  actionNames: string[] = []

  _actionIndex: number = -1
  _action: AnimationAction | null = null

  static createAnimationModel(gltf: Partial<GLTF>) {
    gltf.animations
    const model = AnimationModel.empty()
    model.model = gltf as GLTF
    model.initAnimations()
    return model
  }

  static empty() {
    return new AnimationModel('', '')
  }

  constructor(path: string, name: string, needBox?: boolean) {
    super(path, name, needBox)
  }

  async load() {
    await super.load()
    this.initAnimations()
  }

  initAnimations() {
    this.mixer = new AnimationMixer(this.model!.scene)
    this.model!.animations.forEach((clip) =>
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

  setSpeed(speed: number) {
    if (this.mixer) this.mixer!.timeScale = speed
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
}

export { AnimationModel, InstanceModel, CloneInstanceModel }

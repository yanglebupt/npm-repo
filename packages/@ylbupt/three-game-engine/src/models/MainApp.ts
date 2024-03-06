import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  SRGBColorSpace,
  AnimationMixer,
  Clock,
  LoadingManager,
  Object3D,
  Vector3,
  ColorRepresentation
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { EnvMapType, loadHDRTexture } from '../tools/loader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'

/**
 * @param {ColorRepresentation} backgroundColor 背景颜色
 * @param {boolean} showEnvMap 是否开启展示天空的环境贴图
 * @param {boolean} useEnvMap 天空的环境贴图是否作用于场景
 * @param {string} envMapPath 天空环境贴图路径
 * @param {EnvMapType} envMapType cube 类型，还是 hdr 类型
 * @param {boolean} orbitControl 是否启用控制器
 * @param {boolean} loadWhenConstruct 是否在构造时进行 load
 */
export interface MainAppOptions {
  backgroundColor?: ColorRepresentation
  showEnvMap?: boolean
  useEnvMap?: boolean
  envMapPath?: string
  envMapType?: EnvMapType
  orbitControl?: boolean
  loadWhenConstruct?: boolean
}

/**
 * @param {Scene} scene 场景对象
 * @param {PerspectiveCamera} mainCamera 主相机
 * @param {WebGLRenderer} renderer 渲染器
 * @param {OrbitControls} orbitControl 轨道控制器
 * @param {clock} Clock 全局时钟
 * @param {AnimationMixer[]} mixers 该场景下的全部动画控制器
 * @param {LoadingManager} manager 该场景下的加载管理
 * @param {Map<string, ScriptObject3D>} objects 该场景下所有对象
 * @param {MainAppOptions} options 构造函数参数
 * @method load 开始加载场景
 */
export class MainApp {
  scene: Scene
  mainCamera: PerspectiveCamera
  renderer: WebGLRenderer
  composer: EffectComposer | null = null
  orbitControl: OrbitControls | null
  clock: Clock
  dt: number = 0
  t: number = 0
  mixers: AnimationMixer[]
  loadingManager: LoadingManager
  container: HTMLDivElement
  options: MainAppOptions
  private _lookAt: Vector3 = new Vector3(0, 0, 0)

  create() {}

  constructor(options: MainAppOptions) {
    this.container = document.createElement('div')
    document.body.appendChild(this.container)

    this.scene = new Scene()
    this.scene.background = new Color(options.backgroundColor || 0xcccccc)

    this.mainCamera = new PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.mainCamera.position.set(0, 0, -5)
    this.mainCamera.name = 'MainCamera'
    this.scene.add(this.mainCamera)

    this.renderer = this.createRenderer()

    this.orbitControl = options.orbitControl
      ? new OrbitControls(this.mainCamera, this.renderer.domElement)
      : null

    window.addEventListener('resize', this.resize.bind(this))

    this.container.appendChild(this.renderer.domElement)

    this.mixers = []
    this.clock = new Clock()
    this.loadingManager = new LoadingManager()
    this.options = options

    const { loadWhenConstruct = true } = this.options
    if (loadWhenConstruct)
      /* 加载资源 */
      this.load()
  }

  /* 创建并设置 renderer */
  createRenderer(_renderer?: WebGLRenderer) {
    const renderer: WebGLRenderer & { outputColorSpace: string } =
      _renderer ??
      (new WebGLRenderer({
        antialias: true
      }) as any)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    if (renderer.outputColorSpace) {
      renderer.outputColorSpace = SRGBColorSpace
    }
    renderer.setAnimationLoop(this.render.bind(this))
    return renderer
  }

  /* 释放当前 App 的 renderer */
  disposeRenderer() {
    this.container.removeChild(this.renderer.domElement)
    this.renderer.forceContextLoss()
    this.renderer.dispose()
    // @ts-ignore
    this.renderer.domElement = null
    // @ts-ignore
    this.renderer = null
  }

  /* 更新当前 App 的 renderer */
  updateRenderer(_renderer: WebGLRenderer) {
    this.disposeRenderer()
    this.container.appendChild(_renderer.domElement)
    this.renderer = _renderer
  }

  /* 异步加载资源的 */
  async load() {
    const { envMapPath, envMapType, showEnvMap, useEnvMap } = this.options
    if (envMapPath)
      await this.setEnvironment(envMapPath, envMapType, useEnvMap, showEnvMap)
  }

  resize() {
    this.mainCamera.aspect = window.innerWidth / window.innerHeight
    this.mainCamera.updateProjectionMatrix()
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.render()
  }

  render() {
    const dt = this.clock.getDelta()
    const t = this.clock.getElapsedTime()
    const renderObject = (value?: Object3D) => {
      if (!value) return
      const script = Reflect.get(value, 'script')
      if (script) {
        script.render(t, dt)
        Reflect.set(script, 'freeze', false)
      }
      value.children.forEach(renderObject)
    }
    renderObject(this.scene)
    this.mixers.forEach((mixer) => mixer.update(dt))
    if (this.composer) this.composer.render()
    else this.renderer.render(this.scene, this.mainCamera)
    this.orbitControl?.update()
    this.dt = dt
    this.t = t
  }

  /* 设置环境贴图 */
  async setEnvironment(
    path: string,
    envMapType?: EnvMapType,
    useEnvMap?: boolean,
    showEnvMap?: boolean
  ) {
    const texture = await loadHDRTexture(path, envMapType, this.loadingManager)
    if (useEnvMap) this.scene.environment = texture
    if (showEnvMap) this.scene.background = texture
  }

  destroy() {
    this.renderer.setAnimationLoop(null)
    this.scene.traverse((child) => {
      // @ts-ignore
      if (child.material) {
        // @ts-ignore
        child.material.dispose()
      }
      // @ts-ignore
      if (child.geometry) {
        // @ts-ignore
        child.geometry.dispose()
      }
      // @ts-ignore
      child = null
    })
    this.container.innerHTML = ''
    this.renderer.forceContextLoss()
    this.renderer.dispose()
    this.scene.clear()
    // @ts-ignore
    this.scene = null
    // @ts-ignore
    this.camera = null
    // @ts-ignore
    this.orbitControl = null
    // @ts-ignore
    this.renderer.domElement = null
    // @ts-ignore
    this.renderer = null
    // @ts-ignore
    this.container = null
    // @ts-ignore
    window.app = null
  }

  set lookAt(lookAt: Vector3) {
    this._lookAt = lookAt
    this.mainCamera.lookAt(lookAt)
    if (this.orbitControl) {
      this.orbitControl.target = lookAt
    }
  }

  get lookAt() {
    return this._lookAt
  }
}

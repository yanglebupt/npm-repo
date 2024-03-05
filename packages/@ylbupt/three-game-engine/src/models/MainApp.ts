import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  sRGBEncoding,
  SRGBColorSpace,
  AnimationMixer,
  Clock,
  LoadingManager,
  Object3D,
  Vector3,
  ColorRepresentation
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { loadHDRTexture } from '../tools/loader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'

/**
 * @param {string} bgPath 天空图片地址
 * @param {string} backgroundColor 背景颜色
 * @param {boolean} isBox 是否 cube 类型，还是 hdr 类型
 * @param {string} background 天空是否覆盖背景颜色
 */
export interface MainAppOptions {
  bgPath?: string
  backgroundColor?: ColorRepresentation
  isBox?: boolean
  background?: boolean
  orbitControl?: boolean
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
  manager: LoadingManager
  container: HTMLDivElement
  options: MainAppOptions
  _lookAt: Vector3 = new Vector3(0, 0, 0)

  create() {}

  constructor(options: MainAppOptions) {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const scene = new Scene()
    scene.background = new Color(options.backgroundColor || 0xcccccc)

    const mainCamera = new PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    mainCamera.position.set(0, 0, -5)
    mainCamera.name = 'MainCamera'
    scene.add(mainCamera)

    const renderer = this.createRenderer()

    const orbitControl = options.orbitControl
      ? new OrbitControls(mainCamera, renderer.domElement)
      : null

    window.addEventListener('resize', this.resize.bind(this))

    this.container = container
    this.scene = scene
    this.mainCamera = mainCamera
    this.renderer = renderer
    this.updateRenderer(renderer, false)
    this.orbitControl = orbitControl
    this.mixers = []
    this.clock = new Clock()
    this.manager = new LoadingManager()
    this.options = options
  }

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
    } else {
      renderer.outputEncoding = sRGBEncoding
    }
    renderer.setAnimationLoop(this.render.bind(this))
    return renderer
  }

  disposeRenderer() {
    this.container.removeChild(this.renderer.domElement)
    this.renderer.forceContextLoss()
    this.renderer.dispose()
    // @ts-ignore
    this.renderer.domElement = null
    // @ts-ignore
    this.renderer = null
  }

  updateRenderer(_renderer: WebGLRenderer, flag = true) {
    this.disposeRenderer()
    this.container.appendChild(_renderer.domElement)
    if (flag) this.renderer = _renderer
  }

  async load() {
    const { bgPath, isBox, background } = this.options
    if (bgPath) await this.setEnvironment(bgPath, isBox, background)
    this.render()
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

  async setEnvironment(path: string, isBox?: boolean, background?: boolean) {
    const texture = await loadHDRTexture(path, isBox, this.manager)
    this.scene.environment = texture
    if (background) this.scene.background = texture
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

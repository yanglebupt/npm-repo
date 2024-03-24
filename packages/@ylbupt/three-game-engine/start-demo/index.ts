import {
  AnimationModel,
  ColliderScript,
  Input,
  LoaderBar,
  MainApp,
  SoundManager,
  cloneModel
} from '@ylbupt/three-game-engine'
import {
  BoxGeometry,
  HemisphereLight,
  LoadingManager,
  Mesh,
  MeshBasicMaterial
} from 'three'
import { LoaderBarDomElement } from './loader-bar'
import { RotateScript, RotateScriptOptions } from './scripts/Rotate'

export class MyApp extends MainApp {
  soundManager: SoundManager
  input: Input
  box: Mesh
  model: AnimationModel
  loaderBar: LoaderBar
  collider_1: ColliderScript
  collider_2: ColliderScript

  mounted() {
    /* 进度条 */
    this.loaderBar = new LoaderBar(new LoaderBarDomElement())
    /* 收集 LoadingManager */
    this.loaderBar.addLoadingManager('manager-1', this.loadingManager)

    /* 一个声音管理器 */
    this.soundManager = new SoundManager(
      'sound-group-01',
      '/start-demo/assets/',
      [{ name: 'engine.mp3', loop: false, volume: 0.5 }],
      this.loadingManager
    )

    /* 一个事件监听管理器 */
    this.input = new Input({
      click: this.onClick.bind(this)
    })

    /* 添加一个几何对象 */
    this.box = new Mesh(
      new BoxGeometry(1, 1, 1),
      new MeshBasicMaterial({
        color: 0xff0000
      })
    )
    this.box.name = 'box'
    this.box.position.set(0, 0, 0)
    this.scene.add(this.box)
    /* 挂载脚本 */
    this.box.addScript<RotateScript, RotateScriptOptions>(RotateScript, {
      dir: 'y'
    })
    /* 挂载碰撞器 */
    this.collider_1 = this.box.addScript<ColliderScript>(ColliderScript)

    /* 加载 GLTF 模型 */
    const loadingManager_2 = new LoadingManager()
    this.model = new AnimationModel(
      '/start-demo/assets/eve2.glb',
      'plane',
      false,
      loadingManager_2
    )
    this.scene.add(this.model)
    this.loaderBar.addLoadingManager('manager-2', loadingManager_2)
    /* 挂载脚本 */
    this.model.addScript<RotateScript>(RotateScript, {
      dir: 'x'
    })
    /* 挂载碰撞器 */
    this.collider_2 = this.model.addScript<ColliderScript>(ColliderScript)

    /* 添加环境光，照亮模型 */
    const ambient = new HemisphereLight(0xffffff)
    this.scene.add(ambient)
  }

  async load() {
    this.loaderBar.show()

    await Promise.all([
      super.load(),
      this.soundManager.load(),
      this.model.load()
    ])
    this.model.loopAllActions(3000)

    this.loaderBar.hidden()
  }

  render() {
    super.render()
    this.collider_1.intersects(this.collider_2)

    if (this.collider_1.triggerEnter()) {
      document.getElementById('state')!.innerText = 'Enter'
    }
    if (this.collider_1.triggerStay()) {
      document.getElementById('state')!.innerText = 'Stay'
    }
    if (this.collider_1.triggerExit()) {
      document.getElementById('state')!.innerText = 'Exit'
    }
  }

  onClick() {
    const soundName = 'engine.mp3'
    if (this.soundManager.isPlaying(soundName)) {
      this.soundManager.pause(soundName)
    } else {
      this.soundManager.play('engine.mp3')
    }
  }
}

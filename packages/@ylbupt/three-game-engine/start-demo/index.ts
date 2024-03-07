import {
  AnimationModel,
  Input,
  InstanceModel,
  MainApp,
  MainAppOptions,
  SoundManager,
  cloneModel
} from '@ylbupt/three-game-engine'
import {
  BoxGeometry,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial
} from 'three'

export class MyApp extends MainApp {
  soundManager: SoundManager
  input: Input
  model: AnimationModel
  constructor(options: MainAppOptions) {
    super(options)

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
    const box = new Mesh(
      new BoxGeometry(1, 1, 1),
      new MeshBasicMaterial({
        color: 0xff0000
      })
    )
    box.position.set(0, 0, 0)
    this.scene.add(box)

    /* 加载 GLTF 模型 */
    this.model = new AnimationModel(
      '/start-demo/assets/eve2.glb',
      'plane',
      true,
      this.loadingManager
    )

    /* 添加环境光，照亮模型 */
    const ambient = new HemisphereLight(0xffffff)
    this.scene.add(ambient)

    /* 手动 load 资源 */
    this.load()
  }

  async load() {
    await Promise.all([
      super.load(),
      this.soundManager.load(),
      this.model.load()
    ])
    /* 将加载的模型添加到场景中 */
    this.scene.add(this.model.getRootObject()!)
    this.mixers.push(this.model.mixer!)
    this.model.loopAllActions(3000)
    this.model.position.set(0, 2, 0)
    this.model.rotateY(45)
  }

  render() {
    super.render()
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

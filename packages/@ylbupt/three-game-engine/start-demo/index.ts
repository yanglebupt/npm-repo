import {
  Input,
  MainApp,
  MainAppOptions,
  SoundManager
} from '@ylbupt/three-game-engine'
import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial
} from 'three'

export class MyApp extends MainApp {
  soundManager: SoundManager
  input: Input
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

    /* 手动 load 资源 */
    this.load()
  }

  async load() {
    Promise.all([super.load(), this.soundManager.load()])
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

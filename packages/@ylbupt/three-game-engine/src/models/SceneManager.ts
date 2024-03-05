import { MainApp } from './MainApp'

export class SceneManager {
  sceneMap: Map<number, MainApp> = new Map()
  constructor() {}

  addScene(id: number, scene: MainApp) {
    this.sceneMap.set(id, scene)
  }

  load(id: number) {
    const scene = this.sceneMap.get(id)
    if (!scene) return
    // 清空场景
    scene?.destroy()

    // @ts-ignore
    // window.app = new scene.constructor({
    //   background: true,
    //   bgPath: '/src/assets/plane/paintedsky/',
    //   isBox: true
    // })
    window.app = scene.create()
  }
}

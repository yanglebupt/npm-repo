import { MainApp } from './MainApp'

export type SceneID = number | string | symbol

export class SceneManager {
  sceneMap: Map<SceneID, () => MainApp> = new Map()
  constructor() {}

  addScene(id: SceneID, createScene: () => MainApp) {
    this.sceneMap.set(id, createScene)
  }

  loadScene<T extends MainApp>(id: SceneID) {
    const createScene = this.sceneMap.get(id)
    if (!createScene) return
    // 清空当前场景
    window.app?.destroy()
    // 新建 id 场景
    const app = bootstrap(createScene())
    window.app = app
    return app as T
  }
}

export function bootstrap(app: MainApp) {
  app.mounted()
  app.loadWithLifecycle()
  return app
}

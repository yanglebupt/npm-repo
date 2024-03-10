import { MainApp } from './MainApp'

export class SceneManager {
  sceneMap: Map<number, () => MainApp> = new Map()
  constructor() {}

  addScene(id: number, createScene: () => MainApp) {
    this.sceneMap.set(id, createScene)
  }

  load(id: number) {
    const createScene = this.sceneMap.get(id)
    if (!createScene) return
    // 清空当前场景
    window.app?.destroy()
    // 新建 id 场景
    const app = bootstrap(createScene())
    window.app = app
    return app
  }
}

export function bootstrap(app: MainApp) {
  app.mounted()
  app.loadWithLifecycle()
  return app
}

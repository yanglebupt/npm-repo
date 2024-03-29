import { MainApp } from './MainApp'

export type SceneID = number | string | symbol
export type SceneManager = Map<SceneID, () => MainApp>

export const DefaultSceneManager: SceneManager = new Map()

export function addScene(
  id: SceneID,
  createScene: () => MainApp,
  manager?: SceneManager
) {
  ;(manager ?? DefaultSceneManager).set(id, createScene)
}

export function loadScene<T extends MainApp>(
  id: SceneID,
  manager?: SceneManager
) {
  const createScene = (manager ?? DefaultSceneManager).get(id)
  if (!createScene) return
  // 清空当前场景
  window.app?.destroy()
  // 新建 id 场景
  const app = bootstrap(createScene())
  window.app = app
  return app as T
}

export function bootstrap(app: MainApp) {
  app.mounted()
  app.loadWithLifecycle()
  return app
}

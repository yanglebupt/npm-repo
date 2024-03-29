import { MainApp, MainAppOptions } from '../models/MainApp'
import { SceneID, addScene } from '../models/SceneManager'

// 提供一个类装饰器来完成场景添加
export type AddSceneDecoratorType = (
  id: SceneID,
  options?: MainAppOptions
) => ClassDecorator
export const AddScene: AddSceneDecoratorType =
  (id: SceneID, options?: MainAppOptions) => (target: Function) => {
    addScene(
      id,
      () => new (target as new (options?: MainAppOptions) => MainApp)(options)
    )
  }

# bootstrap()

通过执行场景对象的 `mounted()` 和 `loadWithLifecycle()`，启动一个场景，如<a href="javascript:changeHash(`#/APIs/MainApp?id=loadwithlifecycle`)">生命周期</a>所示

```typescript
export function bootstrap(app: MainApp) {
  app.mounted()
  app.loadWithLifecycle()
  return app
}
```

# SceneManager

该类可以很好地进行多场景管理和切换，内部通过 `sceneMap` 来保存场景的工厂函数，每个场景的工厂函数都需要一个唯一的 `id` 标识，后续通过这个 `id` 来加载对应场景，其类型如下

```typescript
export type SceneID = number | string | symbol
```

## Methods

#### addScene()

向 Map 中添加一个场景工厂函数

```typescript
function addScene(
  id: SceneID, 
  createScene: () => MainApp
): void
```

#### loadScene()

`destroy()` 当前场景，然后根据 id 启动一个场景。首先先在 Map 中查找场景工厂函数，然后调用创建场景对象，最后通过 <a href="javascript:changeHash(`#/APIs/SceneManager?id=bootstrap`)">`bootstrap()`</a> 方法启动场景

```typescript
function loadScene<T extends MainApp>(
  id: SceneID,
): T
```

## 装饰器

我们提供了 `@AddScene` 装饰器来更加方便添加场景，接受的参数是 `(id: SceneID, options?: MainAppOptions)`

```typescript
@AddScene(1, {
  orbitControl: true,
  showHelper: true
})
export class MyApp extends MainApp {}
```

然后我们就可以之间加载场景了

```typescript
import { loadScene } from '@ylbupt/three-game-engine'
loadScene(1)
```
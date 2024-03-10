### SceneManager

该类可以很好的进行多场景管理和切换

- `sceneMap: Map<number, () => MainApp>` 存放所有的场景工厂函数
- `addScene(id: number, createScene: () => MainApp): void` 向 Map 中添加一个场景工厂函数，并给一个唯一 id
- `load(id: number): MainApp` 根据 id 启动一个场景，首先先在 Map 中查找场景工厂函数，然后调用创建场景

使用例子

```typescript
import { SceneManager } from '@ylbupt/three-game-engine'

const _SceneManager = new SceneManager()
_SceneManager.addScene(
  1,
  () =>
    new MyApp({
      orbitControl: true
    })
)

const app = _SceneManager.load(1)
```

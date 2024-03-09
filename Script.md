## Script

该模块允许通过自定义脚本来控制 3D 对象，并挂载到 3D 对象上，由 `MainApp` 负责更新脚本，类似于 Unity 中 Script 的使用，基本用法如下

```typescript
import { ObjectScript } from '@ylbupt/three-game-engine'

export class RotateScript extends ObjectScript {
  render(time: number, dt: number) {
    this.object.rotateY(dt)
  }
}
```

每个脚本必须继承自抽象类 `ObjectScript`，并实现 `render(time: number, dt: number)` 方法，其自带属性如下

- `object` 脚本挂载在的 `Object3D` 对象
- `uuid` 脚本的唯一 id

### Object3D

我们在 `Object3D` 的原型链上添加了控制脚本的方法

#### addScript

向 `Object3D` 添加一个脚本，其类型如下

```typescript
function addScript<T extends ObjectScript>(
  script: new (object: Object3D) => T
): T 
```

使用案例如下，注意不需要去实例化，只需将脚本类名传入即可

```typescript
const script:RotateScript = box.addScript<RotateScript>(RotateScript)
```
#### getScript

获取指定类型的脚本脚本

```typescript
const script:RotateScript = box.getScript<RotateScript>(RotateScript)
```

#### removeScript

删除指定类型的脚本

```typescript
box.removeScript<RotateScript>(RotateScript)
```

#### clearScript 

清除所有脚本

```typescript
box.clearScript()
```


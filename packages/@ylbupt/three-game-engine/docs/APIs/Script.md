# Script

该模块允许通过自定义脚本来控制 3D 对象，类似于 Unity 中 Script 的使用，基本用法如下

```typescript
import { ObjectScript } from '@ylbupt/three-game-engine'

/* options 类型 */
export interface RotateScriptOptions {
  speed: number
}

export class RotateScript extends ObjectScript<RotateScriptOptions> {
  render(time: number, dt: number) {
    this.object.rotateY(dt * this.options.speed)  /* 通过 this.options 访问传入的参数 */
  }
}
```

每个脚本必须继承自抽象类 `ObjectScript`，而其实现了 `Script` 接口，提供了 5 个生命周期钩子，默认钩子函数的实现都是空函数

```typescript
export interface Script {
  awaked(): void
  created(): void
  render(time: number, dt?: number): void
  helper(scene?: Scene): void
  beforeDestroy(): void
}
```

## Attributes

- `object` 脚本挂载在的 `Object3D` 对象，对于外部加载的对象，需要在 `created()` 及其之后才能进行操作
- `uuid` 脚本的唯一 id

# 挂载

为了将脚本挂载到 3D 对象上，我们在 `Object3D` 和 `InstanceModel` 的原型链上添加了控制脚本的方法

#### addScript

向 `Object3D` 添加一个脚本，其类型如下

```typescript
function addScript<
  T extends ObjectScript<O>,
  O extends ObjectScriptOptions
>(
  script: new (object: Object3D, options?: O) => T, 
  options?: O
) => T 
```

使用案例如下，注意不需要去实例化，只需将脚本类名和 options 参数传入即可，我们建议在 `mounted()` 中挂载脚本

```typescript
mounted(){
  this.script = box.addScript<
    RotateScript, 
    RotateScriptOptions
  >( RotateScript, { speed: 10 } )
}
```

并在挂载到 3D 对象上，由 `MainApp` 中的 `loadWithLifecycle()` 负责执行脚本的生命周期函数，

#### getScript

获取指定类型的脚本脚本

```typescript
const script: RotateScript = box.getScript<RotateScript>(RotateScript)
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


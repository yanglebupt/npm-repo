# Collider

该模块实现了检测碰撞，并提供回调函数类来处理碰撞事件

## ColliderScript

这是一个内置脚本，在渲染过程中会更新包围盒，并对目标进行碰撞检测，直接挂载即可

```typescript
/* 挂载碰撞器 */
this.collider_2 = this.model.addScript<ColliderScript>(ColliderScript)
```

### Attributes

`enter` 是否开始碰撞。`stay` 是否持续碰撞。`exit` 是否退出碰撞。`freeze` 是否冻结碰撞，为 true 则不进行碰撞检测

### Methods

#### turnBoxHelper()

开启或者关闭显示包围盒辅助对象

#### removeBoxHelper()

清除包围盒辅助对象

#### intersects()

和具体某个对象进行碰撞检测

```typescript
function intersects(
  collider?: ColliderScript | Object3D | null
) => void
```

#### triggerEnter()

是否开始碰撞，若 `freeze=true`，永远返回 `false`，下面两个方法也是一样的

#### triggerStay()

是否持续碰撞

#### triggerExit()

是否退出碰撞

### Example

```typescript
render() {
  super.render()
  this.collider_1.intersects(this.collider_2)

  if (this.collider_1.triggerEnter()) {
    console.log('Enter')
  }
  if (this.collider_1.triggerStay()) {
    console.log('Stay')
  }
  if (this.collider_1.triggerExit()) {
    console.log('Exit')
  }
}
```

### Input

用来统一管理事件监听的类

#### options

构造方法可接受的参数类型为

```typescript
constructor(keys: (keyof DocumentEventMap)[], fns?: ((evt: Event) => void)[])  // 数组形式
constructor(KeyFnPair: KeyFnPair<DocumentEventMap>)  // 对象形式
```

#### Methods
- `addEventListener(k: EventKey, fn: EventFunc)` 添加一个监听
- `removeEventListener(k: keyof DocumentEventMap)` 取消监听


使用例子如下

```typescript
this.input = new Input({
  click: this.onClick.bind(this),
  mousedown: this.onMousedown.bind(this)
})
```

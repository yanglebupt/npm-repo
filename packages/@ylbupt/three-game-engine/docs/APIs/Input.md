# Input

用来统一管理事件监听的类

## Constructor

构造方法可接受的参数类型为

```typescript

export type EventKey = keyof DocumentEventMap
export type EventFunc = (evt: Event) => void
export type KeyFnPair<T> = {
  [P in keyof T]?: EventFunc
}

constructor(keys: EventKey[], fns: EventFunc[])  // 数组形式
constructor(KeyFnPair: KeyFnPair<DocumentEventMap>)  // 对象形式
```

## Methods

- `addEventListener(k: EventKey, fn: EventFunc)` 添加一个监听
- `removeEventListener(k: EventKey)` 取消监听
- `removeAllEventListener()` 取消所有监听


使用例子如下

```typescript
mounted(){
  this.input = new Input({
    click: this.onClick.bind(this)
  })
}
onClick(){
  // code
}
beforeDestroy(){
  this.input.removeAllEventListener()
}
```

# LoaderBar

该模块实现了展示加载资源的进度，其工作原理是：收集应用所使用到的 `LoadingManager`，读取其加载进度并汇总 

## Constructor

构造函数只需要传入一个实现了 `DomElement` 接口的类来具体展示进度

```typescript
export interface DomElement {
  setPercentage: (percentage: number, name?: string, url?: string) => void
  onLoaded: (name?: string) => void
  showLoading: () => void
  hiddenLoading: () => void
}
```

#### setPercentage()

具体加载百分比的回调

#### onLoaded()

某一个 `LoadingManager` 加载完毕的回调

#### showLoading()

显示进度条

#### hiddenLoading()

隐藏进度条

#### Example

具体可以参考 <a href="https://github.com/yanglebupt/npm-repo/blob/dev/packages/%40ylbupt/three-game-engine/start-demo/loader-bar/index.ts">LoaderBarDomElement</a> 的实现

## Attributes

`count` 属性代表了这个 `LoaderBar` 收集了多少个 `LoadingManager` 

## Methods

- `addLoadingManager(name: string, manager: LoadingManager) => void` 收集一个 `LoadingManager`
- `show() => void` 在页面上显示 `DomElement` 元素 
- `hidden() => void` 在页面上隐藏 `DomElement` 元素 

注意一般我们在 `MainApp` 的构造方法或者 `mounted()` 中进行添加 `addLoadingManager`，然后在 `load()` 加载资源之前显示 `show()`，资源加载完后 `hidden()`。为了更好的用户体验，`hidden()` 操作需要在 DOM 进度更新到 `100%` 后才执行，因此可以用 `MutationObserver` 来监听 DOM 属性修改，具体可以参考 <a href="https://github.com/yanglebupt/npm-repo/blob/dev/packages/%40ylbupt/three-game-engine/start-demo/loader-bar/index.ts">LoaderBarDomElement</a> 的实现



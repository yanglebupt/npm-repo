# 介绍

这是一个模块化开发 `three.js` 应用的库，以面向对象的方式编写你的应用

/>>> <a href="#">案例演示</a>

# 安装

```bash
npm i @ylbupt/three-game-engine
```

# 快速开始

/>>> <a href="./start-demo/index.ts"> 快速开始 Demo </a>

# 更多文档

<a href="./docs/tools.md">tools</a>，<a href="./docs/AnimationModel.md">AnimationModel</a>，<a href="./docs/Coordinate.md">Coordinate</a>，<a href="./docs/LoaderBar.md">LoaderBar</a>，<a href="./docs/Script.md">Script</a>，

# 主要 API

## Models

`models` 模块下实现了框架的核心逻辑，下面逐一介绍用法

### MainApp

管理整个场景，开发的应用必须继承 `MainApp` 类

#### options

构造方法可接受的参数类型为 `MainAppOptions`

| 属性 | 描述 | 类型 |	默认值 |
|:--------|:---------:|:---------:|--------:|
| `backgroundColor` | 背景颜色 | `ColorRepresentation` | `0xcccccc` |
| `showEnvMap` | 是否开启展示天空的环境贴图 | `boolean` | `false` |
| `useEnvMap` | 天空的环境贴图是否作用于场景 | `boolean` | `false` |
| `envMapPath` | 环境贴图路径 | `string` | `''` |
| `envMapType` | 环境贴图是 cube 类型，还是 hdr 类型 | `EnvMapType` | `EnvMapHDR` |
| `orbitControl` | 是否启用控制器 | `boolean` | `false` |
| `loadWhenConstruct` | 是否在构造时进行 load | `boolean` | `true` |

当你需要重写 `load()` 方法时，请将 `loadWhenConstruct` 设为 `false`，并自己调用 `load()` 方法

#### Attributes and Methods

| 属性 | 描述 | 类型 |	默认值 |
|:--------|:---------:|:---------:|--------:|
| `scene` | 场景对象 | `Scene` ||
| `mainCamera` | 场景主相机 | `PerspectiveCamera` ||
| `renderer` | 渲染器 | `WebGLRenderer` ||
| `composer` | 渲染组合器 | `EffectComposer` | `null` |
| `orbitControl` | 控制器 | `OrbitControls` | `null` |
| `clock` | 全局时钟 | `Clock` ||
| `dt` | 每帧间隔时间 (s) | `number` ||
| `t` | 运行总时间 (s) | `number` ||
| `mixers` | 动画混合器 | `AnimationMixer[]` | `[]` |
| `loadingManager` | 加载管理器 | `LoadingManager` ||
| `container` | 挂在 DOM 的 `div` 容器 | `HTMLDivElement` ||
| `options` | 构造函数的参数 | `MainAppOptions` ||
| `lookAt` | 相机看点 | `Vector3: setter getter` ||

| 方法 | 描述 | 类型 |
|:--------|:---------:|--------:|
| `create` | 应用创建的方法（无实现，暂时用不到）| `() => App extends MainAPP` |
| `createRenderer` | 创建一个渲染器 | `(_renderer?: WebGLRenderer) => WebGLRenderer` |
| `disposeRenderer` | 释放当前 App 的 renderer | `() => void` |
| `updateRenderer` | 更新当前 App 的 renderer | `(_renderer: WebGLRenderer) => void` |
| `render` | 每帧调用的渲染函数 | `() => void` |
| `destroy` | 销毁当前场景和应用 | `() => void` |
| `load` | 加载资源 (将在初始化中进行调用) | `async () => void` |
| `setEnvironment` | 设置环境贴图 (将在 load 中调用) | `async (path: string, isBox?: boolean, useEnvMap?: boolean,showEnvMap?: boolean) => void` |

`load()` 函数中一般需要重写来加载场景所需的各种资源，如下

```typescript
async load() {
  // 展示进度条
  this.loaderBar.show()
  // 飞机模型
  const model = new Plane()
  // 障碍物模型
  const obs = new Obstacles()

  await Promise.all([
    super.load(),
    model.load(),
    obs.load(),
    this.soundManager.load()  // 一起加载
  ])

  // load 完成添加到场景中
  this.scene.add(model.getValue()!)
  this.scene.add(obs.getValue()!)

  // 加载完成隐藏进度条
  this.loaderBar.hidden()
  }
```

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

### SoundManager

#### options

构造方法可接受的参数类型为

| 属性 | 描述 | 类型 |	默认值 |
|:--------|:---------:|:---------:|--------:|
| `name` | 管理器唯一的名字 | `string` | 必须 | 
| `path` | 资源根路径 | `string` | 必须 |
| `sounds` | 音频选项数组 | `AudioOptions[]` | 必须 |
| `loadingManager` | 加载管理者 | `LoadingManager` | 必须 |

其中音频选项类型 `AudioOptions` 为

```typescript
export interface AudioOptions {
  name: string  /* 带后缀的音频文件名，也是唯一标识 */
  isPosition?: boolean /* 是否是位置音频，默认 false */
  loop?: boolean /* 默认 false */
  volume?: number /* 默认 0.5 */
}
```

#### Attributes and Methods

| 属性 | 描述 | 类型 |	默认值 |
|:--------|:---------:|:---------:|--------:|
| `audioListener` | 声音监听器 | `AudioListener` ||
| `audioLoader` | 声音加载器 | `AudioLoader` ||

基本的方法都是根据 `音频名字(name)` 调整音频属性

- `setVolume(name: string, volume?: number)`
- `setLoop(name: string, loop?: number)`
- `play(name: string, volume?: number, loop?: boolean)`
- `stop(name: string)`
- `pause(name: string)`
- `isPlaying(name: string)`
- `stopAll()`
- `async load()` 开始加载资源

注意别忘了在所属类中的 `load()` 方法中调用 `this.soundManager.load()`，同时对于位置声音，需要将 `this.soundManager.audioListener` 添加到相机上

使用例子如下

```typescript
this.loadingManager = new LoadingManager()
// 加载声音
this.soundManager = new SoundManager(
  'sound-group-01',
  '/src/assets/plane/',
  [
    { name: 'engine.mp3', loop: true, volume: 1 },
    { name: 'bonus.mp3' },
    { name: 'explosion.mp3' },
    { name: 'gliss.mp3' },
    { name: 'gameover.mp3' }
  ],
  this.loadingManager
)
```

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

# SoundManager

该类可以统一管理一组音频，并对其中的音频进行播放、暂停、查询状态等基本操作

## Constructor

```typescript
constructor(
  name: string,
  path: string,
  sounds: AudioOptions[],
  loadingManager: LoadingManager
)
```

| 属性 | 描述 | 类型 |	默认值 |
|:--------|:---------:|:---------:|--------:|
| `name` | 管理器唯一的名字 | `string` | 必须 | 
| `path` | 资源根路径 | `string` | 必须 |
| `sounds` | 音频选项数组 | `AudioOptions[]` | 必须 |
| `loadingManager` | 加载管理者 | `LoadingManager` | 必须 |

其中音频选项类型 `AudioOptions` 如下

```typescript
export interface AudioOptions {
  name: string  /* 带后缀的音频文件名，也是唯一标识 */
  isPosition?: boolean /* 是否是位置音频，默认 false */
  loop?: boolean /* 默认 false */
  volume?: number /* 默认 0.5 */
}
```

## Attributes 

| 属性 | 描述 | 类型 |	默认值 |
|:--------|:---------:|:---------:|--------:|
| `audioListener` | 声音监听器 | `AudioListener` ||
| `audioLoader` | 声音加载器 | `AudioLoader` ||

注意对于设置了 `isPosition=true`，需要将 `audioListener` 添加到相机上

## Methods

方法都是根据音频唯一名字 `name` 来调整音频属性

- `setVolume(name: string, volume?: number)`
- `setLoop(name: string, loop?: number)`
- `play(name: string, volume?: number, loop?: boolean)`
- `stop(name: string)`
- `pause(name: string)`
- `isPlaying(name: string)`
- `stopAll()`
- `async load()` 开始加载资源

使用例子如下

```typescript
mounted(){
  this.loadingManager = new LoadingManager()
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
}

async load(){
  await Promise.all([
    super.load(),
    this.soundManager.load()
  ])

  this.soundManager.play("engine.mp3")
}
```

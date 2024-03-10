
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

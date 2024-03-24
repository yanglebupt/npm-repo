# InstanceModel

用来加载无动画的 `GLTF` 模型的类，是后续加载带有动画的 `GLTF` 模型的基类

## Constructor

```typescript
constructor(
  path: string,  /* 模型路径 */
  name: string,  /* 模型名字 */
  needBox = false, /* 是否添加包围盒 */
  loadingManager?: LoadingManager,  /* LoadingManager 类*/
  options?: LoadGLTFOptions, /* 加载 GLTF 的配置 */
)
```

注意这里的包围盒是静态的，不会随着模型运动而改变，如果想要添加动态包围盒，请设置 `needBox=false` 并使用 <a href="javascript:changeHash(`#/APIs/Collider?id=colliderscript`)">`ColliderScript`</a> 脚本。加载 GLTF 的配置选项类型如下

```typescript
export type LoadGLTFOptions = Partial<{
  onProgress: (percent: number, total?: number) => void
  decoderPath: string
  decoderConfig: object
}>
```

最重要的是指定 draco decoder 的 `decoderPath` 和 `decoderConfig`

## Attributes 

| 属性 | 描述 | 类型 |	默认值 |
|:--------|:---------:|:---------:|--------:|
| `model` | 加载后的带的 GLTF 模型 | `GLTF` | `null` |
| `box` | `needBox=true` 设置的 Box 包围盒 | `Box3` | `null` |

注意 `model` 属性必须要在 `load()` 方法调用后才能获取到，否则就是 `null`

## Methods

| 方法 | 描述 | 类型 |
|:--------|:---------:|--------:|
| `load` | 开始加载资源 | `async () => void` |
| `getRootObject` | 加载后获取模型的根场景对象 | `() => Group<Object3DEventMap>` |

使用例子如下

```typescript
mounted(){
  this.model = new InstanceModel(
    '/start-demo/assets/microplane.glb',
    'plane',
    true,
    this.loadingManager,
    {decoderPath: '/src/libs/draco/'}
  )
  /* 将加载的模型添加到场景中 */
  this.scene.add(this.model)
}

async load() {
  await Promise.all([
    super.load(),
    this.model.load()
  ])
}
```

注意当需要控制加载的 3D 物体的属性时需要通过 `getRootObject()` 方法获取根对象，然后进行控制位移，旋转等，十分不方便，因此我们已经将 `InstanceModel` 实例的原型指向了该 3D 物体，现在可以直接操作 `InstanceModel` 实例来控制 3D 物体的属性，但需要注意在 load 之后才能操作

```typescript
// after load
/* InstanceModel 实例上也有对应的 Object3D 方法 */
this.model.position.set(0, 2, 0)
this.model.rotateY(45)
```

当然后续我们会统一采用<a href="javascript:changeHash(`#/APIs/Script?id=script`)">自定义脚本</a>来完成对物体的控制

# AnimationModel 

用来加载带有模型动画的 `GLTF` 模型的类，继承自 `InstanceModel`，其构造函数参数不变，并且使用方式相同，但新增了许多可以控制模型动画播放的属性和函数

## Attributes 

| 属性 | 描述 | 类型 |	默认值 |
|:--------|:---------:|:---------:|--------:|
| `mixer` | 需要在 render 中进行更新  | `AnimationMixer` | `null` |
| `namedAnimationClip` | 加载后的模型动画名字和动画片段的字典 | `{}` | `{}` |
| `actionNames` | 加载后的模型动画名字数组 | `string[]` | `[]` |
| `loaded` | 是否加载完毕 | `boolean` | `false` |

只有加载完毕也就是 `loaded=true` 才可以调用模型动画

## Methods

| 方法 | 描述 | 类型 |
|:--------|:---------:|--------:|
| `render` | 更新 `mixer`，需要在父 render 中调用 | `(time: number, dt: number) => void` |
| `load` | 加载资源，需要在父 load 中调用 | `() => void` |
| `getAction` | 获得某个动画片段的动作 | `(actionName: string) => AnimationAction` |
| `setSpeed` | 设置动画混合器的播放速度 | `(timeScale: number) => void` |
| `set actionIndex` | 播放指定索引的动画，索引是对应动画名字在 `actionNames` 数组中对应的位置 | `(index: number) => void` |
| `get actionIndex` | 获得当前播放动画的索引 | `() => number` |
| `get actionName` | 获得当前播放动画的名字 | `() => string` |
| `loopAllActions` | 以固定间隔循环播放所有动画 | `(delay: number) => void` |

# cloneGLTF()

克隆一个 `GLTF` 模型的方法，暂不支持克隆模型所挂载的脚本

```typescript
function cloneGLTF(
  gltf: Partial<GLTF>,
  isAnimationSkin = true,  /* 是否进行动画骨骼的克隆 */
  deleteObjectNames?: string[] | string /* 排除那些不需要克隆的 3D 对象的名字 */
) => Partial<GLTF>
```

# cloneModel()

从一个已经存在的模型，克隆模型，暂不支持克隆模型所挂载的脚本

```typescript
function cloneModel<T extends InstanceModel = InstanceModel>
(
  model: T,
  name: string,
  needBox = false
) => T 
```
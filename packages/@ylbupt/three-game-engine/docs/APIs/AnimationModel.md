## InstanceModel

用来加载 `GLTF` 模型的类，并且带有添加包围盒的功能，是后续其他加载 `GLTF` 模型的基类

### options

```typescript
constructor(
  path: string,  /* 模型路径 */
  name: string,  /* 模型名字 */
  needBox = false /* 是否添加包围盒 */
  loadingManager?: LoadingManager  /* LoadingManager 类*/
) => InstanceModel
```

### Attributes and Methods

| 属性 | 描述 | 类型 |	默认值 |
|:--------|:---------:|:---------:|--------:|
| `model` | 加载后的带的 GLTF 模型 | `GLTF` | `null` |
| `box` | `needBox=true` 设置的 Box 包围盒 | `Box3` | `null` |

| 方法 | 描述 | 类型 |
|:--------|:---------:|--------:|
| `load` | 开始加载资源 | `async () => void` |
| `getRootObject` | 加载后获取模型的根场景对象 | `() => Group<Object3DEventMap>` |
| `makeBox` | 从一个3D对象中为模型设置一个包围盒 | `(object: Object3D) => void` |
| `turnBoxHelper` | 是否开启可视化包围盒 | `(open: boolean = false) => void` |

静态工厂创建方法，可以从一个已经加载好的模型克隆出来，注意一些辅助性的 3D 对象不需要克隆，可见 <a href="#clonegltf">cloneGLTF</a>

```typescript
 static createFromGLTF<T extends InstanceModel>(
  constructor: new (
    path: string,
    name: string,
    needBox?: boolean,
    loadingManager?: LoadingManager
  ) => T,
  gltf: Partial<GLTF>,
  name: string,
  needBox = false
) => T
```

使用例子如下

```typescript
/* 加载 GLTF 模型 */
this.model = new InstanceModel(
  '/start-demo/assets/microplane.glb',
  'plane',
  true,
  this.loadingManager
)

async load() {
  await Promise.all([
    super.load(),
    this.model.load()
  ])
  /* 将加载的模型添加到场景中 */
  this.scene.add(this.model.getRootObject()!) 
}
```

注意当需要控制加载的 3D 物体的属性时需要需要通过 `getRootObject()` 方法获取根对象，然后进行控制位移，旋转等，十分不方便，因此我们已经将 `InstanceModel` 实例的原型指向了 `Group`，现在可以直接操作 3D 物体的属性

```typescript
export interface InstanceModel extends Group {}
export class InstanceModel {}

// 例子 this.model 就是 InstanceModel 的一个实例
/* 将加载的模型添加到场景中 */
this.scene.add(this.model.getRootObject()!)
this.mixers.push(this.model.mixer!)
this.model.loopAllActions(3000)
this.model.position.set(0, 2, 0)
this.model.rotateY(45)
```

当然后续我们会统一采用<a href="./Script.md">自定义脚本</a>来完成对物体的控制

## AnimationModel 

用来加载带有模型动画的 `GLTF` 模型的类，继承自 `InstanceModel` 并实现了 `Script` 接口，其构造函数参数不变，但新增了许多可以控制模型动画播放的属性和函数

### Attributes and Methods

| 属性 | 描述 | 类型 |	默认值 |
|:--------|:---------:|:---------:|--------:|
| `mixer` | 需要在 render 中进行更新  | `AnimationMixer` | `null` |
| `namedAnimationClip` | 加载后的模型动画名字和动画片段的字典 | `{}` | `{}` |
| `actionNames` | 加载后的模型动画名字数字 | `string[]` | `[]` |
| `loaded` | 是否加载完毕 | `boolean` | `false` |

| 方法 | 描述 | 类型 |
|:--------|:---------:|--------:|
| `render` | 更新 `mixer`，需要在父 render 中调用 | `(time: number, dt: number) => void` |
| `load` | 加载资源，需要在父 load 中调用 | `() => void` |
| `getAction` | 获得某个动作 | `(actionName: string) => AnimationAction` |
| `setSpeed` | 设置动画混合器的播放速度 | `(timeScale: number) => void` |
| `set actionIndex` | 播放指定索引的动画，索引是对应动画名字在属性 `actionNames` 中 | `(index: number) => void` |
| `get actionIndex` | 获得当前播放动画的索引 | `() => number` |
| `get actionName` | 获得当前播放动画的名字 | `() => string` |
| `loopAllActions` | 以固定间隔循环播放所有动画 | `(delay: number) => void` |

## cloneGLTF

克隆一个 `GLTF` 模型的方法

```typescript
function cloneGLTF(
  gltf: Partial<GLTF>,
  isAnimationSkin = true,  /* 是否进行动画骨骼的克隆 */
  deleteObjectNames?: string[] | string /* 排除那些不需要克隆的 3D 对象名字 */
) => Partial<GLTF>
```

## cloneModel

从一个已经存在的模型，克隆模型

```typescript
function cloneModel<T extends InstanceModel = InstanceModel>
(
  model: T,
  name: string,
  needBox = false
) => T 
```
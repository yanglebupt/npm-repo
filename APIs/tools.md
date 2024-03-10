## Tools
该模块提供了一些常用方法

### common

#### waitUnitCondition

轮询直到 `conditionFn` 返回 `conditionFn`，`gasp` 参数设置轮询间隔

```typescript
function waitUnitCondition(
  gasp: number, 
  conditionFn: () => boolean
) => Promise
```


#### forIter

遍历迭代器对象，例如 `Map.keys()`

```typescript
function forIter<T>(
  iter: IterableIterator<T>,
  callback: (value?: T) => void
)
```

#### iter2list

迭代器转数组

```typescript
function iter2list<T>(
  iter: IterableIterator<T>
)
```

#### clamp

```typescript
function clamp(
  v: number, min: number, max: number
) => number
```

#### random

```typescript
function random(
  min: number, max: number
) => number
```


### loader

#### loadGLTFModel

加载 `GLTF` 模型文件

```typescript
async function loadGLTFModel(
  path: string,
  needDecoder = true,
  loadingManager?: LoadingManager,
  options?: Partial<{
    onProgress: (percent: number, total?: number) => void
    decoderPath: string
    decoderConfig: object
  }>
) => Promise<GLTF>
```

#### loadHDRTexture

加载 `HDR` 贴图，可以是 `Cube` 的8个面，命令方式如下

```
['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']
```

也可以是一张 `HDR` 全景图  

```typescript
async function loadHDRTexture(
  path: string,
  type: EnvMapType = EnvMapCube,
  loadingManager?: LoadingManager
) => Promise<Texture>
```

#### loadTexture

加载普通贴图，被设置贴图属性

```typescript
 function loadTexture(
  filename: string, 
  options: TextureOptions = {},
  loadingManager?: LoadingManager
) => Texture 
```

### geometry

一些自定义的可编程的几何物体

```typescript
function createStarGeometry(
  innerRadius: number, 
  outerRadius: number
) => ExtrudeGeometry
```
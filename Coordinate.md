## Coordinate

该模块提供了一些常用的坐标和向量操作方法

### Direction

提供了一些基本方向的定义

```typescript
export class Direction {
  static up = new Vector3(0, 1, 0)
  static down = new Vector3(0, -1, 0)
  static forward = new Vector3(0, 0, 1)
  static back = new Vector3(0, 0, -1)
  static left = new Vector3(-1, 0, 0)
  static right = new Vector3(1, 0, 0)
}
```

### ClampVector2

永远将一个向量进行 `clamp` 操作

```typescript
constructor(
  x: number, // 初始 x
  y: number, // 初始 y
  min: number,  // min
  max: number // max
)
```

分量 `x/y`，都是以 `getter` 和 `setter` 的形式进行读取或者修改，在修改时会自动进行 `clamp` 操作，包括构造函数传入的初始 `x/y`

### Coordinate

该类实现了不同坐标系之间转换的静态方法

- `window2ndc(point: Vector2)`
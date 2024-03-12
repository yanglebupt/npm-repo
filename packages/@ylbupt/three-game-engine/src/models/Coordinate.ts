import { Vec3 } from 'cannon-es'
import { Vector2, Vector3 } from 'three'
import { clamp } from 'three/src/math/MathUtils'

// 坐标系管理
export class Coordinate {
  static window2ndc(point: Vector2) {
    const x = (point.x / window.innerWidth) * 2 - 1
    const y = -(point.y / window.innerHeight) * 2 + 1
    return new Vector2(x, y)
  }
  static Vec3toVector3(vec: Vec3): Vector3 {
    return new Vector3(vec.x, vec.y, vec.z)
  }
  static Vector3toVec(vec: Vector3): Vec3 {
    return new Vec3(vec.x, vec.y, vec.z)
  }
}

export class ClampVector2 {
  _x = 0
  _y = 0
  min: number
  max: number
  constructor(x: number, y: number, min: number, max: number) {
    this.min = min
    this.max = max
    this.x = x
    this.y = y
  }
  get x() {
    return this._x
  }
  get y() {
    return this._y
  }
  set x(v: number) {
    this._x = clamp(v, this.min, this.max)
  }
  set y(v: number) {
    this._y = clamp(v, this.min, this.max)
  }

  get up() {
    return this._x
  }
  get right() {
    return this._y
  }
  set up(v: number) {
    this._x = clamp(v, this.min, this.max)
  }
  set right(v: number) {
    this._y = clamp(v, this.min, this.max)
  }
}

export class Direction {
  static up = new Vector3(0, 1, 0)
  static down = new Vector3(0, -1, 0)
  static forward = new Vector3(0, 0, 1)
  static back = new Vector3(0, 0, -1)
  static left = new Vector3(-1, 0, 0)
  static right = new Vector3(1, 0, 0)
}

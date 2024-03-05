import { ExtrudeGeometry, Shape } from 'three'

// 使用 shape 和 挤出 创建几何
export function createStarGeometry(innerRadius: number, outerRadius: number) {
  const shape = new Shape()
  shape.moveTo(outerRadius, 0)
  const incTheta = (Math.PI * 2) / 10
  let inner = true
  for (let theta = incTheta; theta <= Math.PI * 2; theta += incTheta) {
    const radius = inner ? innerRadius : outerRadius
    shape.lineTo(radius * Math.cos(theta), radius * Math.sin(theta))
    inner = !inner
  }
  return new ExtrudeGeometry(shape, {
    steps: 1,
    depth: 0.2,
    bevelEnabled: false
  })
}

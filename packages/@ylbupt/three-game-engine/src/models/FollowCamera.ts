import { Camera, Material, Mesh, Object3D, Raycaster, Vector3 } from 'three'
import { Direction } from './Coordinate'

/**
 * 跟随相机，相机和人物之间的物体是否透明处理
 */
export class FollowCamera {
  object: Object3D
  camera: Camera
  followCamera: Object3D
  transparent: boolean
  opacity: number
  raycaster: Raycaster
  blocks: Object3D[]
  excludes: Object3D[] = []
  transparentBlocks: Object3D[] = []

  constructor(
    object: Object3D,
    camera: Camera,
    transparent = true,
    blocks: Object3D[] = [],
    opacity = 0.5,
    excludes: Object3D[] = []
  ) {
    this.camera = camera
    this.object = object
    this.transparent = transparent
    this.opacity = opacity
    this.raycaster = new Raycaster()
    this.blocks = blocks
    this.excludes = excludes

    this.followCamera = new Object3D()
    this.followCamera.position.copy(camera.position)
    this.followCamera.quaternion.copy(camera.quaternion)
    this.followCamera.visible = false
    this.object.attach(this.followCamera)
  }

  update(lookAt: Vector3) {
    this.transparentBlocks.forEach((object) => {
      this.opacityObject(object, false)
    })
    this.transparentBlocks = []
    const cameraPos = new Vector3()
    this.camera.position.copy(this.followCamera.getWorldPosition(cameraPos))
    const target = Direction.forward
      .clone()
      .applyQuaternion(this.object.quaternion) // 这里只是一个方向
      .add(this.object.position) // 需要初始坐标点+方向，得到终点
      .add(lookAt) // 通过 lookAt 改变朝向
    this.camera.lookAt(target)
    if (this.transparent && this.blocks.length > 0) {
      const diret = new Vector3()
        .copy(this.object.position)
        .sub(cameraPos)
        .normalize()
      this.raycaster.set(cameraPos, diret)
      const intersections = this.raycaster.intersectObjects(this.blocks, true)
      const dist = cameraPos.distanceTo(this.object.position)
      if (intersections.length > 0) {
        this.transparentBlocks = intersections
          .filter((intersect) => {
            return (
              intersect.distance < dist &&
              !this.excludes.includes(intersect.object)
            )
          })
          .map((intersect) => intersect.object)
        this.transparentBlocks.forEach((object) => {
          this.opacityObject(object, true)
        })
      }
    }
    return target
  }

  opacityObject(_object: Object3D, transparent = true) {
    const object = _object as Mesh
    // object.material = new MeshBasicMaterial({
    //   color: 0xff0000
    // })
    ;(object.material as Material).transparent = transparent
    ;(object.material as Material).opacity = transparent ? this.opacity : 1
  }
}

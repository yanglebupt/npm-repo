import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export interface Settings {
  stepFrequency: number
  quatNormalizeSkip: number
  quatNormalizeFast: boolean
  gx: number
  gy: number
  gz: number
  iterations: number
  tolerance: number
  k: number
  d: number
  scene: number
  paused: boolean
  rendermode: 'solid'
  constraints: boolean
  contacts: boolean // Contact points
  cm2contact: boolean // center of mass to contact points
  normals: boolean // contact normals
  axes: boolean // "local" frame axes
  particleSize: number
  shadows: boolean
  aabbs: boolean
  profiling: boolean
  maxSubSteps: number
}
export class CannonHelper {
  scene: THREE.Scene
  world: CANNON.World
  sun?: THREE.Light
  defaultMaterial?: THREE.MeshLambertMaterial
  settings?: Settings
  particleGeo?: THREE.SphereGeometry
  particleMaterial?: THREE.MeshLambertMaterial

  constructor(scene: THREE.Scene, world: CANNON.World) {
    this.scene = scene
    this.world = world
  }

  set wireframe(mode: boolean) {
    this.world.bodies.forEach((body: any) => {
      if (body.threemesh !== undefined) {
        body.threemesh.traverse((child: any) => {
          if (child.isMesh) child.material.wireframe = mode
        })
        if (body.threemesh.isMesh) body.threemesh.material.wireframe = mode
      }
    })
  }

  createQuaternionFromAxisAngle(axis: CANNON.Vec3, angle: number) {
    const q = new CANNON.Quaternion()
    q.setFromAxisAngle(axis, angle)
    return q
  }

  addLights(renderer: THREE.WebGLRenderer) {
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap // default THREE.PCFShadowMap

    // LIGHTS
    const ambient = new THREE.AmbientLight(0x888888)
    this.scene.add(ambient)

    const light = new THREE.DirectionalLight(0xdddddd)
    light.position.set(3, 10, 4)
    light.target.position.set(0, 0, 0)

    light.castShadow = true

    const lightSize = 10
    light.shadow.camera.near = 1
    light.shadow.camera.far = 50
    light.shadow.camera.left = light.shadow.camera.bottom = -lightSize
    light.shadow.camera.right = light.shadow.camera.top = lightSize

    light.shadow.mapSize.width = 1024
    light.shadow.mapSize.height = 1024

    this.sun = light
    this.scene.add(light)
  }

  createCannonTrimesh(geometry: THREE.BufferGeometry) {
    if (!geometry.isBufferGeometry) return null

    const posAttr = geometry.attributes.position
    const vertices = (geometry.attributes.position as THREE.BufferAttribute)
      .array
    let indices: number[] = []
    for (let i = 0; i < posAttr.count; i++) {
      indices.push(i)
    }

    return new CANNON.Trimesh(Array.from(vertices), indices)
  }

  createCannonConvex(geometry: THREE.BufferGeometry) {
    if (!geometry.isBufferGeometry) return null

    const posAttr = geometry.attributes.position
    const floats = (geometry.attributes.position as THREE.BufferAttribute).array
    const vertices: CANNON.Vec3[] = []
    const faces: Array<number>[] = []
    let face: number[] = []
    let index = 0
    for (let i = 0; i < posAttr.count; i += 3) {
      vertices.push(new CANNON.Vec3(floats[i], floats[i + 1], floats[i + 2]))
      face.push(index++)
      if (face.length == 3) {
        faces.push(face)
        face = []
      }
    }

    return new CANNON.ConvexPolyhedron({ vertices, faces })
  }

  addVisual(
    body: CANNON.Body,
    color = 0x888888,
    name = 'mesh',
    castShadow = true,
    receiveShadow = true
  ) {
    Reflect.set(body, 'name', name)
    if (this.defaultMaterial === undefined && color == 0x888888)
      this.defaultMaterial = new THREE.MeshLambertMaterial({ color: color })
    const material =
      color == 0x888888
        ? this.defaultMaterial
        : new THREE.MeshLambertMaterial({ color: color })
    if (this.settings === undefined) {
      this.settings = {
        stepFrequency: 60,
        quatNormalizeSkip: 2,
        quatNormalizeFast: true,
        gx: 0,
        gy: 0,
        gz: 0,
        iterations: 3,
        tolerance: 0.0001,
        k: 1e6,
        d: 3,
        scene: 0,
        paused: false,
        rendermode: 'solid',
        constraints: false,
        contacts: false, // Contact points
        cm2contact: false, // center of mass to contact points
        normals: false, // contact normals
        axes: false, // "local" frame axes
        particleSize: 0.1,
        shadows: false,
        aabbs: false,
        profiling: false,
        maxSubSteps: 3
      }
      this.particleGeo = new THREE.SphereGeometry(1, 16, 8)
      this.particleMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 })
    }
    // What geometry should be used?
    let mesh
    if (body instanceof CANNON.Body)
      mesh = this.shape2Mesh(body, castShadow, receiveShadow, material)

    if (mesh) {
      // Add body
      Reflect.set(body, 'threemesh', mesh)
      mesh.castShadow = castShadow
      mesh.receiveShadow = receiveShadow
      this.scene.add(mesh)
    }

    return mesh
  }

  shape2Mesh(
    body: CANNON.Body,
    castShadow: boolean,
    receiveShadow: boolean,
    material = this.defaultMaterial
  ) {
    const obj = new THREE.Object3D()
    const game = this
    let index = 0

    body.shapes.forEach((shape) => {
      let mesh
      let geometry
      let points: THREE.Vector3[]
      let v0, v1, v2
      let a, b, c

      switch (shape.type) {
        case CANNON.Shape.types.SPHERE:
          const sphere_geometry = new THREE.SphereGeometry(
            (shape as CANNON.Sphere).radius,
            8,
            8
          )
          mesh = new THREE.Mesh(sphere_geometry, material)
          break

        case CANNON.Shape.types.PARTICLE:
          mesh = new THREE.Mesh(game.particleGeo, game.particleMaterial)
          const s = this.settings!
          mesh.scale.set(s.particleSize, s.particleSize, s.particleSize)
          break

        case CANNON.Shape.types.PLANE:
          geometry = new THREE.PlaneGeometry(10, 10, 4, 4)
          mesh = new THREE.Object3D()
          const submesh = new THREE.Object3D()
          const ground = new THREE.Mesh(geometry, material)
          ground.scale.set(100, 100, 100)
          submesh.add(ground)

          mesh.add(submesh)
          break

        case CANNON.Shape.types.BOX:
          const box_geometry = new THREE.BoxGeometry(
            (shape as CANNON.Box).halfExtents.x * 2,
            (shape as CANNON.Box).halfExtents.y * 2,
            (shape as CANNON.Box).halfExtents.z * 2
          )
          mesh = new THREE.Mesh(box_geometry, material)
          break

        case CANNON.Shape.types.CONVEXPOLYHEDRON:
          points = [] // Add vertices
          ;(shape as CANNON.ConvexPolyhedron).vertices.forEach(function (v) {
            points.push(new THREE.Vector3(v.x, v.y, v.z))
          })

          const geo = new THREE.BufferGeometry().setFromPoints(points)

          const indices: any[] = []
          ;(shape as CANNON.ConvexPolyhedron).faces.forEach(function (face) {
            // add triangles
            const a = face[0]
            for (let j = 1; j < face.length - 1; j++) {
              const b = face[j]
              const c = face[j + 1]
              indices.push(a, b, c)
            }
          })
          geo.setIndex(indices)
          geo.computeBoundingSphere()
          // geo.computeFaceNormals()
          this.computeFaceNormals(points, geo)
          mesh = new THREE.Mesh(geo, material)
          break

        case CANNON.Shape.types.HEIGHTFIELD:
          points = []
          const _shape = shape as CANNON.Heightfield
          v0 = new CANNON.Vec3()
          v1 = new CANNON.Vec3()
          v2 = new CANNON.Vec3()
          for (let xi = 0; xi < _shape.data.length - 1; xi++) {
            for (let yi = 0; yi < _shape.data[xi].length - 1; yi++) {
              for (let k = 0; k < 2; k++) {
                _shape.getConvexTrianglePillar(xi, yi, k === 0)
                v0.copy(_shape.pillarConvex.vertices[0])
                v1.copy(_shape.pillarConvex.vertices[1])
                v2.copy(_shape.pillarConvex.vertices[2])
                v0.vadd(_shape.pillarOffset, v0)
                v1.vadd(_shape.pillarOffset, v1)
                v2.vadd(_shape.pillarOffset, v2)
                points.push(
                  new THREE.Vector3(v0.x, v0.y, v0.z),
                  new THREE.Vector3(v1.x, v1.y, v1.z),
                  new THREE.Vector3(v2.x, v2.y, v2.z)
                )
              }
            }
          }

          geometry = new THREE.BufferGeometry().setFromPoints(points)
          geometry.computeBoundingSphere()
          // geometry.computeFaceNormals()
          this.computeFaceNormals(points, geometry)
          mesh = new THREE.Mesh(geometry, material)
          break

        case CANNON.Shape.types.TRIMESH:
          points = []
          const normals = []

          v0 = new CANNON.Vec3()
          v1 = new CANNON.Vec3()
          v2 = new CANNON.Vec3()

          for (
            let i = 0;
            i < (shape as CANNON.Trimesh).indices.length / 3;
            i++
          ) {
            ;(shape as CANNON.Trimesh).getTriangleVertices(i, v0, v1, v2)

            points.push(
              new THREE.Vector3(v0.x, v0.y, v0.z),
              new THREE.Vector3(v1.x, v1.y, v1.z),
              new THREE.Vector3(v2.x, v2.y, v2.z)
            )
          }

          geometry = new THREE.BufferGeometry().setFromPoints(points)
          geometry.computeBoundingSphere()
          geometry.computeVertexNormals()

          mesh = new THREE.Mesh(geometry, material)
          break

        default:
          throw 'Visual type not recognized: ' + shape.type
      }

      mesh.receiveShadow = receiveShadow
      mesh.castShadow = castShadow

      mesh.traverse(function (child: any) {
        if (child.isMesh) {
          child.castShadow = castShadow
          child.receiveShadow = receiveShadow
        }
      })

      var o = body.shapeOffsets[index]
      var q = body.shapeOrientations[index++]
      mesh.position.set(o.x, o.y, o.z)
      mesh.quaternion.set(q.x, q.y, q.z, q.w)

      obj.add(mesh)
    })

    return obj
  }

  computeFaceNormals(points: THREE.Vector3[], geometry: THREE.BufferGeometry) {
    const data: number[] = []

    const a = new THREE.Vector3()
    const b = new THREE.Vector3()
    const c = new THREE.Vector3()

    for (let i = 0; i < points.length; i += 3) {
      a.copy(points[i]).sub(points[i + 1])
      b.copy(points[i + 2]).sub(points[i + 1])
      c.crossVectors(a, b).normalize()
      data.push(c.x, c.y, c.z)
      data.push(c.x, c.y, c.z)
      data.push(c.x, c.y, c.z)
    }

    const normals = Float32Array.from(data)
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  }

  removeVisual(body: CANNON.Body) {
    const threemesh = Reflect.get(body, 'threemesh')
    if (threemesh) this.scene.remove(threemesh)
  }

  update() {
    this.world.bodies.forEach(function (body: any) {
      if (body.threemesh !== undefined) {
        body.threemesh.position.copy(body.position)
        body.threemesh.quaternion.copy(body.quaternion)
      }
    })
  }
}

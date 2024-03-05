import { Broadphase, Solver, Vec3, World, Body } from 'cannon-es'
import { CannonHelper } from '../../libs/CannonHelper'
import { Scene, WebGLRenderer } from 'three'

export interface WorldOptions {
  gravity?: Vec3
  frictionGravity?: Vec3
  allowSleep?: boolean
  broadphase?: Broadphase
  solver?: Solver
  quatNormalizeFast?: boolean
  quatNormalizeSkip?: number
}

export interface VisualOptions {
  color?: number
  name?: string
  castShadow?: boolean
  receiveShadow?: boolean
}

/**
 * cannon world
 */
export class MainWorld {
  world: World
  cannonHelper: CannonHelper
  isDebug: boolean

  constructor(
    options: WorldOptions,
    scene: Scene,
    renderer: WebGLRenderer,
    isDebug = true
  ) {
    this.world = new World(options)
    this.cannonHelper = new CannonHelper(scene, this.world)
    this.cannonHelper.addLights(renderer)
    this.isDebug = isDebug
  }

  addBody(body: Body, options?: VisualOptions) {
    this.world.addBody(body)
    if (this.isDebug)
      this.cannonHelper.addVisual(
        body,
        options?.color,
        options?.name,
        options?.castShadow,
        options?.receiveShadow
      )
  }

  removeBody(body: Body) {
    this.world.removeBody(body)
    this.cannonHelper.removeVisual(body)
  }

  render() {
    this.world.fixedStep()
    this.cannonHelper.update()
  }
}

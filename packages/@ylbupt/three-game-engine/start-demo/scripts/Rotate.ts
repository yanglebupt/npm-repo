import { ObjectScript } from '@ylbupt/three-game-engine'

export interface RotateScriptOptions {
  dir: string
}

export class RotateScript extends ObjectScript<RotateScriptOptions> {
  render(time: number, dt: number) {
    this.object.rotateY(dt)
    const { dir = 'x' } = this.options || {}
    if (dir === 'x') {
      this.object.position.setX(Math.sin(time))
    } else if (dir === 'y') {
      this.object.position.setY(Math.sin(time))
    }
  }
}

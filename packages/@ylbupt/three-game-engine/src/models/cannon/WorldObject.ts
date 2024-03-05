import { Body } from 'cannon-es'
import { VisualOptions } from './MainWorld'

export abstract class WorldObject {
  abstract body: Body
  visualOptions: VisualOptions = {}
  getRootBody() {
    return this.body
  }
  getVisualOptions() {
    return this.visualOptions
  }
}

import { ObjectScript, ObjectScriptOptions } from '@ylbupt/three-game-engine'
import { Object3D } from 'three'

export declare module 'three' {
  // 使用interface扩展class的实例属性
  interface Object3D {
    getScriptTarget(): Object3D
    addScript<
      T extends ObjectScript<O>,
      O extends ObjectScriptOptions = ObjectScriptOptions
    >(
      script: new (object: Object3D) => T,
      options?: O
    ): T
    getScript<T extends ObjectScript>(
      script: new (object: Object3D) => T
    ): T | null
    removeScript<T extends ObjectScript>(
      script: new (object: Object3D) => T
    ): boolean
    clearScript(): boolean
  }
}

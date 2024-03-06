import { MyApp } from './start-demo'
import { SceneManager } from '@ylbupt/three-game-engine'

const _SceneManager = new SceneManager()
_SceneManager.addScene(
  1,
  () =>
    new MyApp({
      orbitControl: true,
      loadWhenConstruct: false
    })
)

const app = _SceneManager.load(1)

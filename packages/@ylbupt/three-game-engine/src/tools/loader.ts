import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import {
  CubeTextureLoader,
  EquirectangularReflectionMapping,
  LoadingManager,
  Texture
} from 'three'

// 加载 gltf 模型,首先需要 draco 解压模型
export const loadGLTFModel = async (
  path: string,
  needDecoder = true,
  manager?: LoadingManager,
  onProgress?: (percent: number, total?: number) => void,
  decoderPath?: string,
  decoderConfig?: object
) => {
  const gltfLoader = new GLTFLoader(manager)

  const dracoLoader = new DRACOLoader(manager)
  dracoLoader.setDecoderPath(decoderPath ?? '/libs/draco/')
  dracoLoader.setDecoderConfig(decoderConfig ?? { type: 'js' })
  dracoLoader.preload()

  if (needDecoder) gltfLoader.setDRACOLoader(dracoLoader)
  return new Promise((rlv, rjt) => {
    gltfLoader.load(
      path,
      rlv,
      (xhr) => onProgress && onProgress(xhr.loaded / xhr.total, xhr.total),
      rjt
    )
  }) as Promise<GLTF>
}

// 加载 hdr 贴图
export const loadHDRTexture = async (
  path: string,
  isBox?: boolean,
  manager?: LoadingManager
): Promise<Texture> => {
  if (isBox) {
    const cubeTextureLoader = new CubeTextureLoader(manager).setPath(path)
    return new Promise((rlv, rjt) => {
      cubeTextureLoader
        .loadAsync(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'])
        .then(rlv)
        .catch(rjt)
    })
  } else {
    const hdrLoader = new RGBELoader(manager)
    return new Promise((rlv, rjt) => {
      hdrLoader
        .loadAsync(path)
        .then((texture) => {
          // load 不行，必须使用异步加载
          texture.mapping = EquirectangularReflectionMapping
          rlv(texture)
        })
        .catch(rjt)
    })
  }
}

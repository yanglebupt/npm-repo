import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import {
  CubeTextureLoader,
  EquirectangularReflectionMapping,
  LoadingManager,
  MagnificationTextureFilter,
  Mapping,
  MinificationTextureFilter,
  PixelFormat,
  Texture,
  TextureDataType,
  TextureLoader,
  Wrapping
} from 'three'

export type LoadGLTFOptions = Partial<{
  onProgress: (percent: number, total?: number) => void
  decoderPath: string
  decoderConfig: object
}>

// 加载 gltf 模型, 首先需要 draco 解压模型
export const loadGLTFModel = async (
  path: string,
  needDecoder = true,
  loadingManager?: LoadingManager,
  options?: LoadGLTFOptions
) => {
  const { onProgress, decoderPath, decoderConfig } = options ?? {}

  const gltfLoader = new GLTFLoader(loadingManager)

  const dracoLoader = new DRACOLoader(loadingManager)
  dracoLoader.setDecoderPath(decoderPath ?? '/src/libs/draco/')
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

export const EnvMapCube: 'Cube' = 'Cube'
export const EnvMapHDR: 'HDR' = 'HDR'

export type EnvMapType = typeof EnvMapCube | typeof EnvMapHDR

// 加载 hdr 贴图
export const loadHDRTexture = async (
  path: string,
  type: EnvMapType = EnvMapCube,
  loadingManager?: LoadingManager
): Promise<Texture> => {
  if (type === EnvMapCube) {
    const cubeTextureLoader = new CubeTextureLoader(loadingManager).setPath(
      path
    )
    return new Promise((rlv, rjt) => {
      cubeTextureLoader
        .loadAsync(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'])
        .then(rlv)
        .catch(rjt)
    })
  } else {
    const hdrLoader = new RGBELoader(loadingManager)
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

export interface TextureOptions {
  image?: TexImageSource | OffscreenCanvas
  mapping?: Mapping
  /* 设置 uv 采样超过0-1范围时，如何处理，可以重复、镜像、边缘等方式*/
  wrapS?: Wrapping
  wrapT?: Wrapping
  magFilter?: MagnificationTextureFilter
  minFilter?: MinificationTextureFilter
  format?: PixelFormat
  type?: TextureDataType
  anisotropy?: number
}

export const loadTexture = (
  filename: string,
  options: TextureOptions = {},
  loadingManager?: LoadingManager
) => {
  const tex = new TextureLoader(loadingManager).load(filename)
  Object.keys(options).forEach((k) => {
    Reflect.set(tex, k, options[k as keyof TextureOptions])
  })
  return tex
}

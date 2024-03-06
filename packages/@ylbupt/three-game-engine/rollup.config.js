// rollup --config
/**
 * 打包后的 types 需要另外发布
 */
import { terser } from 'rollup-plugin-terser'
import typescript2 from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: './build/three-game-engine.esm.js',
      format: 'esm'
    },
    {
      file: './build/three-game-engine.cjs.js',
      format: 'cjs'
    }
  ],
  external: [
    'three',
    'lodash-es',
    'three/examples/jsm/controls/OrbitControls',
    'three/src/math/MathUtils',
    'three/examples/jsm/loaders/RGBELoader',
    'three/examples/jsm/loaders/GLTFLoader',
    'three/examples/jsm/loaders/DRACOLoader'
  ],
  plugins: [
    resolve({ extensions: ['.ts'] }),
    typescript2({ tsconfig: './tsconfig.build.json' }),
    terser()
  ]
}

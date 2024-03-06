import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@ylbupt/three-game-engine': resolve(__dirname, 'src/index') // 路径别名
    }
  },
  build: {
    outDir: './html'
  },
  assetsInclude: ['**/*.hdr', '**/*.glb']
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'	
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(), 
    AutoImport({
        imports: ['vue'],  
        resolvers: [
          ElementPlusResolver(),
        ],
      }),
      Components({
        resolvers: [
          ElementPlusResolver()
        ],
      }),
  ],
  resolve: {
    alias: {	// 配置别名 @ 等同于项目文件的 src
      '@': path.resolve(__dirname, 'src')
    }
  }
})

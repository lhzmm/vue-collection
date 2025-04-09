import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import vueJsx from '@vitejs/plugin-vue-jsx'


/**
 * 引入Lh组件
 * @param option {}
 */
function DcResolver(option) {
  return {
    type: 'component',
    resolve(componentName) {
      if (componentName.startsWith('Lh')) {
        const partialName = componentName.slice(2)
        return {
          name: 'default',
          from: `@/components/${partialName}/index.vue`,
        }
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    Components({
      dirs: [],
      resolvers: [
        ElementPlusResolver({ importStyle: 'sass' }),
        DcResolver(),
      ]
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/cover.scss" as *;',
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    }
  }
})

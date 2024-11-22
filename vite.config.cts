import vue from '@vitejs/plugin-vue'
import jsx from '@vitejs/plugin-vue-jsx'
import istanbul from 'vite-plugin-istanbul'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue({
      reactivityTransform: true,
    }),
    jsx(),
    istanbul(),
  ],
})

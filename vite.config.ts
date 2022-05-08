import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import jsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  test: {
    // ...
  },
  plugins: [vue(), jsx()],
})

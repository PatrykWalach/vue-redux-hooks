import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'
import pkg from './package.json'

export default [
  {
    input: 'src/index.ts',

    output: [
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true,
      },
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
      },
      // {
      //   file: pkg.unpkg,
      //   format: 'umd',
      //   name: 'VueReduxHooks',
      //   sourcemap: true,
      //   globals: {
      //     'vue-demi': 'VueDemi',
      //   },
      // },
    ],

    plugins: [typescript()],

    external: ['vue-demi', '@reduxjs/toolkit', '@reduxjs/toolkit/query'],
  },
  {
    input: './dist/dts/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
]

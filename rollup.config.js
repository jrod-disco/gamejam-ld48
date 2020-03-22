import html from 'rollup-plugin-html2';
import scss from 'rollup-plugin-scss';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default [
  {
    input: './src/index.ts',
    output: [
      {
        file: './dist/app.js',
        format: 'iife',
      },
    ],

    plugins: [
      resolve({ browser: true, preferBuiltins: false }),
      commonjs(),
      typescript({}),
      scss(),
      html({ template: './src/index.html' }),
      serve('dist/'),
      livereload(),
    ],
  },
];

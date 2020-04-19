import html from 'rollup-plugin-html2';
import scss from 'rollup-plugin-scss';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';

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
      typescript({}),
      commonjs({
        namedExports: {
          'node_modules/pixi.js/lib/pixi.es.js': ['sound'],
        },
      }),
      scss(),
      html({ template: './src/index.html' }),
      copy({
        targets: [
          {
            src: './src/assets/**/*',
            dest: 'dist/assets/',
          },
        ],
      }),
      serve('dist/'),
      livereload(),
    ],
  },
];

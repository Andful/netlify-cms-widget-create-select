const path = require('path');
const esbuild = require('esbuild');
const alias = require('esbuild-plugin-alias');

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/index.bundle.js',
  sourcemap: true,
  plugins: [
    alias({
      'path': path.resolve(__dirname, `./node_modules/path-browserify/index.js`),
    }),
  ],
}).catch(err => process.exit(1));
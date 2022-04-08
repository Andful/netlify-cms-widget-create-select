const path = require('path');
const esbuild = require('esbuild');
const alias = require('esbuild-plugin-alias');

esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: '../public/main.js',
  sourcemap: true,
  plugins: [
    alias({
      'path': path.resolve(__dirname, `./node_modules/path-browserify/index.js`),
      'react': path.resolve(__dirname, `./node_modules/react/index.js`),
      'react-dom': path.resolve(__dirname, `./node_modules/react/index.js`)
    }),
  ],
}).catch(err => process.exit(1));
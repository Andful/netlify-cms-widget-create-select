const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require("copy-webpack-plugin");

const developmentConfig = {
  mode: 'development',
  entry: ['./dev/index.ts'],
  output: {
    path: path.resolve(__dirname, 'public'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    fallback: { "path": require.resolve("path-browserify") }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
      },
      {
        test: /\.js$/,
        use: 'source-map-loader',
        enforce: 'pre',
      },
      {
        test: /\.js$/,
        exclude: path.resolve(__dirname, 'node_modules'),
        enforce: 'pre',
        use: [{
            loader: 'prettier-loader',
            options: {
                parser: 'babel'
            }
        },{
            loader: 'eslint-loader',
            options: {
              fix: true
            }
        }]
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: path.resolve(__dirname,'dev/static/*'), to: path.resolve(__dirname,'public/[name].[ext]') },
      ],
    }),
  ],
  devtool: 'inline-source-map',
  devServer: {
    contentBase: "./",
    compress: false,
    port: 9000,
    writeToDisk: true
  },
}

const productionConfig = {
  mode: 'production',
  entry: {
      index: ['./src/index.ts']
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    fallback: { "path": require.resolve("path-browserify") }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader"
      },
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
      },
    ],
  },
  devtool: 'source-map',
  output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      library: 'CreateSelectWidget',
      libraryTarget: 'umd',
      libraryExport: 'default',
  }
}

module.exports = process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig

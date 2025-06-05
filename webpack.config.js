const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const PurgeCSSPlugin = require('purgecss-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

module.exports = {
  entry: './src/main.ts',
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      videojs: 'video.js',
      WaveSurfer: 'wavesurfer.js',
      RecordRTC: 'recordrtc'
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ['ts-loader']
      },
      {
        test: /\.(html|css)$/,
        use: 'raw-loader'
      }
    ]
  },
  plugins: [
    new ProvidePlugin({
      videojs: 'video.js/dist/video.cjs.js',
      RecordRTC: 'recordrtc'
    }),
    new HtmlWebpackPlugin({template: './src/index.html' }),
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'defer',
      preload: /\.css$/
    }),
    new PurgeCSSPlugin({ paths: glob.sync('./src/**/*.html', { nodir: true }) })
  ]
}
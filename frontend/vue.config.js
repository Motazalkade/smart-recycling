const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './', // استخدم ./ بدلاً من /
  outputDir: 'dist',
  assetsDir: 'static'
})
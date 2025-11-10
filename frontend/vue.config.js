const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  // إعداد مهم للـ History Mode على الاستضافة
  devServer: {
    historyApiFallback: true,
    allowedHosts: 'all'
  }
})
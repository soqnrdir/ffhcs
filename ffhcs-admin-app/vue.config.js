module.exports = {
  lintOnSave: false,
  devServer: {
    port: 3011,
    host: '0.0.0.0',
    proxy: "http://localhost:3010"
  }
}

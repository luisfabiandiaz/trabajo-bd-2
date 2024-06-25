const {createProxyMiddleware} = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      // 👇️ Make sure to update your target
      target: 'http://localhost:5000',
      changeOrigin: true,
    }),
  );
};
// Local dev proxy: forwards /api/* requests to the Express dev server on port 3001.
// This file is auto-detected by react-scripts (CRA) — no imports needed.
// Run the API server with: node server.dev.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
    })
  );
};

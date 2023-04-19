const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const cors = require('cors');
const errorMiddleware = require('./middleware/error');
const app = express();
var bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const corsConfig = {
  origin: true,
  credentials: true,
};

app.use(cors(corsConfig));
app.options('*', cors(corsConfig));
app.use(express.json());
app.use(cookieParser());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

// Add a proxy to bypass CORS restrictions
app.use(
  '/api/v1/login',
  createProxyMiddleware({
    target: 'http://localhost:4000/api/v1/login',
    changeOrigin: true,
    onProxyRes: function (proxyRes, req, res) {
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Expose-Headers'] = 'Content-Range';
    },
  })
);

// Route Imports
const product = require('./routes/productRoute');
const user = require('./routes/userRoutes');
const order = require('./routes/categoryRoute');
app.use('/api/v1', product);
app.use('/api/v1', user);
app.use('/api/v1', order);
app.use((req, res, next) => {
  res.set('Content-Range', 'products 0-10/20'); // Set the Content-Range header here
  next();
});
// Middleware for errors
app.use(errorMiddleware);

module.exports = app;

const express = require('express');

const errorMiddleware = require('./middleware/error');
const app = express();
var bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

//Route Imports
const product = require('./routes/productRoute');
const user = require('./routes/userRoutes');
const order = require('./routes/categoryRoute');
app.use('/api/v1', product);
app.use('/api/v1', user);
app.use('/api/v1', order);

//Middleware for errors
app.use(errorMiddleware);

module.exports = app;

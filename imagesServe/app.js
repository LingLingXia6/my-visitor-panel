const express = require('express');
const path = require('path');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require("dotenv").config();

const indexRouter = require('./routes/index');
const imageRouter = require('./routes/images');

const app = express();
const cors = require("cors");

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// 设置uploads目录为静态资源目录
app.use(express.static(path.join(__dirname, 'uploads')));



app.use('/', indexRouter);
app.use('/image', imageRouter);

// 404
app.use((req, res, next) => {
    next(createError(404));
  });
  
  // 错误处理
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });

module.exports = app;

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var articlesRouter = require('./routes/articles');
const songsRouter = require('./routes/songs');
const singersRouter = require('./routes/singers');
const songAndsingerRouter = require('./routes/songAndsinger');
const uploadsRouter = require('./routes/uploads');
const searchRouter=require('./routes/search');
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const cors = require('cors');
app.use(cors());
app.use('/', indexRouter);

// 后端路由配置
app.use('/articles', articlesRouter);
app.use('/users', usersRouter);
app.use('/songs', songsRouter);
app.use('/singers', singersRouter);
app.use('/songandsinger', songAndsingerRouter);
app.use('/uploads', uploadsRouter);
app.use('/search',searchRouter)

module.exports = app;

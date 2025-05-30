var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();

var indexRouter = require("./routes/index");
//var usersRouter = require('./routes/users');
const visitorsRouter = require("./routes/visitors");
const hostsRouter = require("./routes/hosts");
const formsRouter = require("./routes/forms");
var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
const cors = require("cors");
app.use(cors());
app.use("/", indexRouter);

// 后端路由配置
app.use("/visitors", visitorsRouter);
app.use("/hosts", hostsRouter);
app.use("/forms", formsRouter);
module.exports = app;

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
require("dotenv").config();

const indexRouter = require("./routes/index");
const usersRouter = require('./routes/users');
const visitorsRouter = require("./routes/visitors");
const hostsRouter = require("./routes/hosts");
const formsRouter = require("./routes/forms");
const dashboardRouter=require("./routes/dashboard");
const { hostMailConsumer ,visitorMailConsumer} = require("./utils/rabbit-mq");
(async () => {
  await hostMailConsumer();
  console.log("host 邮件消费者已经启动")
})();
(async () => {
  await visitorMailConsumer();
  console.log("visitor 邮件消费者已经启动")
})();
const app = express();

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
app.use("/users", usersRouter);
app.use("/dashboard", dashboardRouter);
module.exports = app;

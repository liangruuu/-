var express = require('express');
var app = express();
const router = require('./router')
const db = require('./db')

app.set('views', './views')
app.set('view engine', 'ejs')

;
(async () => {
  //等待连接数据库
  // await db;
  //应用路由器
  app.use(router)
})()

app.listen(8088, function (req, res) {
  console.log("server start...")
})
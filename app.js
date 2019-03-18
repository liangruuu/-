var express = require('express');
var app = express();
const router = require('./router')

app.set('views', './views')
app.set('view engine', 'ejs')

app.use(router)

app.listen(8088, function (req, res) {
  console.log("server start...")
})
var express = require('express');
var app = express();
const auth = require('./auth')

app.use(auth())

app.listen(8088, function (req, res) {
  console.log("server start...")
})
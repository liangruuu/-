var express = require('express');
var app = express();
const auth = require('./auth')

app.set('views', './views')
app.set('view engine', 'ejs')

app.get('/search', (req, res) => {
  res.render('search')
})

app.use(auth())

app.listen(8088, function (req, res) {
  console.log("server start...")
})
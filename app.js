var express = require('express');
var app = express();
const auth = require('./auth')
const Wachat = require('./wechat')
const {
  url
} = require('./config')
const sha1 = require('sha1')
const wechatApi = new Wachat()

app.set('views', './views')
app.set('view engine', 'ejs')

app.get('/search', async (req, res) => {
  /**
   * 生成JS-SDK使用的签名
   * 1. 组合参与签名的四个参数：jsapi_ticket(临时票据)，noncestr(随机字符串)，timestamp(时间戳)，url(当前服务器地址)
   * 2. 将其进行字典序排序，以'&'凭借在一起
   * 3. 进行sha1加密，最终生成signature
   */
  const noncestr = Math.random().split('.')[1]
  const timestamp = Date.now()
  const {
    ticket
  } = await wechatApi.fetchTicket()
  const arr = [
    `jsapi_ticket=${ticket}`,
    `noncestr=${noncestr}`,
    `timestamp=${timestamp}`,
    `url=${url}/search`
  ]
  const str = arr.sort().join('&')
  console.log(str)

  const signature = sha1(str)

  res.render('search', {
    signature,
    noncestr,
    timestamp
  })
})

app.use(auth())

app.listen(8088, function (req, res) {
  console.log("server start...")
})
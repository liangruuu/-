const express = require('express')
const router = new Router()
const reply = require('../reply')
const Wachat = require('../wechat/wechat')
const {
  url
} = require('../config/config')
const sha1 = require('sha1')

const Router = express.Router
const wechatApi = new Wachat()

app.get('/search', async (req, res) => {
  /**
   * 生成JS-SDK使用的签名
   * 1. 组合参与签名的四个参数：jsapi_ticket(临时票据)，noncestr(随机字符串)，timestamp(时间戳)，url(当前服务器地址)
   * 2. 将其进行字典序排序，以'&'凭借在一起
   * 3. 进行sha1加密，最终生成signature
   */
  const noncestr = Math.random().toString().split('.')[1]
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

app.use(reply())

module.exports = router
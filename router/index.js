const express = require('express')
const Router = express.Router
const reply = require('../reply')
const Wachat = require('../wechat/wechat')
const {
  url
} = require('../config/config')
const sha1 = require('sha1')
const Theaters = require('../model/Theater')

const wechatApi = new Wachat()
const router = new Router()

router.get('/search', async (req, res) => {
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

router.get('/detail/:id', async (req, res) => {
  const {
    id
  } = req.params
  if (id) {
    const data = await Theaters.findOne({
      doubanId: id
    }, {
      _id: 0,
      __v: 0,
      createTime: 0,
      doubanId: 0
    })
    console.log(data)
    res.render('detail', {
      data
    })
  } else {
    res.end('error')
  }
})

router.use(reply())

module.exports = router
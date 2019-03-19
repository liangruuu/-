/**
 * 验证服务器的有效性的模块
 */
const sha1 = require('sha1')
const config = require('../config/config')
const {
  getUserDataAsync,
  parseXMLAsync,
  formatMessage
} = require('../utils/tool')
const template = require('./template')
const reply = require('./reply')

module.exports = () => {
  return async (req, res, next) => {
    // 解构赋值
    const {
      signature,
      echostr,
      timestamp,
      nonce
    } = req.query
    const {
      token
    } = config
    /**
     * 1. 将参与微信加密签名的三个参数(timestamp, nonce, token)按照字典序排序并且组合在一起形成一个数组
     * 2. 将数组里所有参数拼接城一个字符串，进行sha1加密
     * 3. 加密完成就生成一个signature，和微信发送过来的进行对比
     */
    const sha1Str = sha1([timestamp, token, nonce].sort().join(""))
    if (req.method === "GET") {
      // 如果一样，说明消息来自于微信服务器，返回echostr给微信服务器
      if (sha1Str === signature) {
        res.send(echostr)
      } else {
        // 如果不一样，说明不是微信服务器发送的消息，返回error
        res.send("error")
      }
    } else if (req.method === "POST") {
      /**
       * 微信服务器会将用户发送的数据以POST请求的方式转发到开发者服务器上
       * 验证消息来自于微信服务器
       */
      if (sha1Str !== signature) {
        res.send("error")
      }
      /**
       * 接收请求体中的数据，因为是流式数据，所以不能用bodyparse解析，需要定义特殊的方法拿到数据
       */
      const xmlData = await getUserDataAsync(req)
      /**
       console.log(xmlData)
        <xml>
          <ToUserName><![CDATA[gh_72d136070634]]></ToUserName>                    // 开发者ID
          <FromUserName><![CDATA[olr5X6Nq0b_NIaslNWXzmsPn6VIQ]]></FromUserName>   // 用户openID
          <CreateTime>1552782976</CreateTime>                                     // 请求发送时间戳
          <MsgType><![CDATA[text]]></MsgType>                                     // 发送消息类型(文本，图片，语音，视频)
          <Content><![CDATA[hh]]></Content>                                       // 发送内容
          <MsgId>22230509493025370</MsgId>                                        // 消息ID，微信服务器回默认保存3天用户发送的数据，通过此ID三天内就能找到消息数据，3天后会被销毁
        </xml>
       */

      /**
       * 将XML数据解析为JS对象
       */
      const jsData = await parseXMLAsync(xmlData)
      /**
       console.log(jsData) 
       {
          xml: {
            ToUserName: ['gh_72d136070634'],
            FromUserName: ['olr5X6Nq0b_NIaslNWXzmsPn6VIQ'],
            CreateTime: ['1552783709'],
            MsgType: ['text'],
            Content: ['yfu'],
            MsgId: ['22230517096537361']
          }
        }
       */

      /**
       * jsData中：xml是不需要的，因为数据里只有一个值，所以不需要数组形式的数据
       * 所以需要格式化数据
       */
      const message = formatMessage(jsData)
      /**
       console.log(message) 
       {
          ToUserName: 'gh_72d136070634',
          FromUserName: 'olr5X6Nq0b_NIaslNWXzmsPn6VIQ',
          CreateTime: '1552784956',
          MsgType: 'text',
          Content: '123',
          MsgId: '22230534229067420'
        }
      */

      // 简单的自动回复，回复文本内容
      /**
       * 一旦遇到以下情况，微信都会在公众号会话中，向用户下发系统提示“该公众号暂时无法提供服务，请稍后再试”：
       * 1、开发者在5秒内未回复任何内容 2、开发者回复了异常数据，比如JSON数据, 字符串, xml数据中有多余空格等
       */
      /**
       * 将reply函数改装成了async函数，此时返回值就变成了promise对象
       * 所以必须用await才能拿到最终的返回值
       *  */ 
      let options = await reply(message)
      console.log(options)
      let replyMessage = template(options)
      console.log(replyMessage)
      // 返回响应给微信服务器
      res.send(replyMessage)

      // console.log(req.query) 
      // {
      //   signature: '09b7efe4ed5de294bed3b3d62af5438b211b76c6',
      //   timestamp: '1552781714',
      //   nonce: '1259171678',
      //   openid: 'olr5X6Nq0b_NIaslNWXzmsPn6VIQ'  // 微信用户的唯一认证ID
      // }

      /**
       * 如果开发者服务器没有返回响应给微信服务器，微信服务器会发送三次相同的请求过来
       * 所以在第一次请求访问的时候就用res.end()终止之后的请求
       * res.end("")
       */
    } else {
      res.send("error")
    }
  }
}
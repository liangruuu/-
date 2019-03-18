/**
 * 处理用户发送的消息类型和内容，决定返回不同的内容给用户（一般只关注文本和语音信息）
 */
module.exports = message => {
  let options = {
    toUserName: message.FromUserName,
    fromUserName: message.ToUserName,
    CreateTime: Date.now(),
    msgType: 'text'
  }

  let content = '您在说什么，我听不懂'
  // 判断消息类型
  if (message.MsgType === 'text') {
    // 判断消息内容
    if (message.Content === '1') { // 全匹配
      content = '大吉大利，今晚吃鸡'
    } else if (message.Content === '2') {
      content = '落地成盒'
    } else if (message.Content.match('爱')) { // 半匹配
      content = '我爱你'
    }
  } else if (message.MsgType === 'voice') {
    // 需再管理界面开启语音识别权限
    options.msgType = 'voice'
    options.mediaId = message.MediaId
    console.log(message.Recognition)
  } else if (message.MsgType === 'event') {
    // 用户订阅事件和取关事件
    if (message.Event === 'subscribe') {
      content = '欢迎您的关注电影公众号~\n' +
        '回复 首页 能看到电影预告片页面\n' +
        '回复 热门 能看到最新最热的电影\n' +
        '回复 文本 能查看指定的电影信息\n' +
        '回复 语音 能查看指定的电影信息\n' +
        '也可以点击下面的菜单按钮，来了解电影公众号'
    } else if (message.Event === 'unsubscribe') {
      console.log('无情取关~')
    } else if (message.Event === 'CLICK') {
      content = '您可以按照以下提示来进行操作~\n' +
        '回复 首页 能看到电影预告片页面\n' +
        '回复 热门 能看到最新最热的电影\n' +
        '回复 文本 能查看指定的电影信息\n' +
        '回复 语音 能查看指定的电影信息\n' +
        '也可以点击下面的菜单按钮，来了解电影公众号'
    }
  }

  options.content = content
  console.log(options)

  return options
}
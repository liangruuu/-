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
  } else if (message.MsgType === 'image') {
    options.msgType = 'image'
    options.mediaId = message.MediaId
    console.log(message.PicUrl)
  } else if (message.MsgType === 'voice') {
    // 需再管理界面开启语音识别权限
    options.msgType = 'voice'
    options.mediaId = message.MediaId
    console.log(message.Recognition)
  } else if (message.MsgType === 'location') {
    // 需再管理界面开启地理位置权限
    content = `维度：${message.Location_X} 经度：${message.Location_Y} 缩放大小：${message.Scale} 位置信息：${message.Label}`
  } else if (message.MsgType === 'event') {
    // 用户订阅事件和取关事件
    if (message.Event === 'subscribe') {
      content = '欢迎您的关注~'
      /**
       * 带参数的二维码事件
       * if(message.Eventkey == 'xxx')
       */
      if (message.Eventkey == 'xxx') {
        content = '用户扫描了带参数的二维码关注事件'
      }
    } else if (message.Event === 'unsubscribe') {
      console.log('取关')
    } else if (message.Event === 'SCAN') {
      content = '用户已关注过，再扫描了带参数的二维码关注事件'
    } else if (message.Event === 'LOCATION') {
      content = `维度：${message.Latitude} 经度：${message.Longitude} 精度：${message.Precision}`
    } else if (message.Event === 'CLICK') {
      content = `您点击了按钮：${message.EventKey}`
    }
  }

  options.content = content
  console.log(options)

  return options
}
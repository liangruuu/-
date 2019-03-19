/**
 * 处理用户发送的消息类型和内容，决定返回不同的内容给用户（一般只关注文本和语音信息）
 */
const rp = require('request-promise-native');
const Theaters = require('../model/Theater')
const {
  url
} = require('../config/config')

module.exports = async message => {

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
    if (message.Content === '热门') { // 全匹配
      // 回复用户热门消息数据
      const data = await Theaters.find({}, {
        title: 1,
        summary: 1,
        image: 1,
        doubanId: 1,
        _id: 0
      })
      // 将回复内容初始化为数组
      content = []
      options.msgType = 'news'
      // 通过遍历将数据添加进去
      for (let i = 0; i < data.length; i++) {
        let item = data[i]
        content.push({
          title: item.title,
          description: item.summary,
          picUrl: item.image,
          url: `${url}/detail/${item.doubanId}`
        })
      }
    } else if (message.Content === '首页') {
      content = '落地成盒'
    } else {
      //搜索用户输入指定电影信息
      //定义请求地址
      // const url = `https://api.douban.com/v2/movie/search?q=${message.Content}&count=8`;
      const url = 'https://api.douban.com/v2/movie/search';
      //发送请求
      // const {subjects} = rp({method: 'GET', url, json: true, qs: {q: message.Content, count: 8}});
      const data = await rp({
        method: 'GET',
        url,
        json: true,
        // qs:查询字符串
        qs: {
          q: message.Content,
          count: 8
        }
      });
      const subjects = data.subjects;
      console.log(data);
      //判断subjects是否有值
      if (subjects && subjects.length) {
        //说明有数据,返回一个图文消息给用户
        //将回复内容初始化为空数组
        content = [];
        options.msgType = 'news';
        //通过遍历将数据添加进去
        for (let i = 0; i < subjects.length; i++) {
          let item = subjects[i];
          content.push({
            title: item.title,
            description: `电影评分为：${item.rating.average}`,
            picUrl: item.images.small,
            url: item.alt
          })
        }
      } else {
        //说明没有数据
        content = '暂时没有相关的电影信息';
      }
    }
  } else if (message.MsgType === 'voice') {
    // console.log(message.Recognition);
    //搜索用户输入指定电影信息
    //定义请求地址
    // const url = `https://api.douban.com/v2/movie/search?q=${message.Recognition}&count=8`;
    const url = 'https://api.douban.com/v2/movie/search';
    //发送请求
    const {
      subjects
    } = await rp({
      method: 'GET',
      url,
      json: true,
      qs: {
        q: message.Recognition,
        count: 8
      }
    });
    //判断subjects是否有值
    if (subjects && subjects.length) {
      //说明有数据,返回一个图文消息给用户
      //将回复内容初始化为空数组
      content = [];
      options.msgType = 'news';
      //通过遍历将数据添加进去
      for (let i = 0; i < subjects.length; i++) {
        let item = subjects[i];
        content.push({
          title: item.title,
          description: `电影评分为：${item.rating.average}`,
          picUrl: item.images.small,
          url: item.alt
        })
      }
    } else {
      //说明没有数据
      content = '暂时没有相关的电影信息';
    }
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
  // console.log(options)

  return options
}
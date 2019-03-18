/**
 * 自定义菜单模块
 */
const {
  url
} = require('../config/config')

module.exports = {
  "button": [{
    "type": "view",
    "name": "电影预告🎬",
    "url": `${url}/movie`
  }, {
    "type": "view",
    "name": "语音识别🎤",
    "url": `${url}/search`
  }, {
    "name": "戳我",
    "sub_button": [{
        "type": "view",
        "name": "官网☀",
        "url": "https://juejin.im/timeline"
      },
      {
        "type": "click",
        "name": "帮助🙏",
        "key": "help"
      }
    ]
  }]
}
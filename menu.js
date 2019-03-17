/**
 * 自定义菜单模块
 */
module.exports = {
  "button": [{
      "type": "click",
      "name": "戳我",
      "key": "CLICK"
    },
    {
      "name": "菜单",
      "sub_button": [{
          "type": "view",
          "name": "搜索",
          "url": "http://www.soso.com/"
        }, {
          "type": "scancode_waitmsg",
          "name": "扫码带提示",
          "key": "rselfmenu_0_0"
        },
        {
          "type": "scancode_push",
          "name": "扫码推事件",
          "key": "rselfmenu_0_1"
        }
      ]
    }, {
      "name": "发图",
      "sub_button": [{
          "type": "pic_sysphoto",
          "name": "系统拍照发图",
          "key": "rselfmenu_1_0"
        },
        {
          "type": "pic_photo_or_album",
          "name": "拍照或者相册发图",
          "key": "rselfmenu_1_1"
        },
        {
          "type": "pic_weixin",
          "name": "微信相册发图",
          "key": "rselfmenu_1_2"
        }
      ]
    }
  ]
}
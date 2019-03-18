/**
 * access_token：微信调用接口全局唯一凭证（只有借助这个凭证才能调用微信提供的接口）
 * 特点：
 *  1. 唯一的
 *  2. 有效期为2小时，提前5分钟请求
 *  3. 接口权限，每天2000次
 * 请求地址：https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
 * 设计思路
 * 1. 首次本地没有，发送请求获取access_token，保存下来（本地文件）
 * 2. 第二次或者以后
 *  - 先去本地读取文件，判断它是否过期
 *    - 过期了
 *      - 重新请求获取access_token，保存下来覆盖之前的文件（保证文件是唯一的）
 *    - 没有过期
 *      - 直接使用
 * 
 * 整理思路
 *  读取本地文件（readAccessToken）
 *    - 本地有文件
 *      - 判断是否过期（isValidAccessToken）
 *        - 过期了
 *          - 重新获取access_token（getAccessToken），保存下来覆盖之前的文件（保证文件是唯一的）（saveAccessToken）
 *        - 没有过期
 *          - 直接使用
 *    - 没有本地文件
 *      - 发送请求获取access_token（getAccessToken），保存下来（本地文件）（saveAccessToken），直接使用
 */
const {
  appID,
  appsecret
} = require('./config')
const rp = require('request-promise-native')
const menu = require('./menu')
const api = require('./utils/api')
const {
  writeFileAsync,
  readFileAsync
} = require('./utils/tool')

class Wechat {
  constructor() {}
  /**
   * 用来获取access_token
   */
  getAccessToken() {
    const url = `${api.accessToken}&appid=${appID}&secret=${appsecret}`
    /**
     * 返回值是一个promise对象
     * 因为操作的是异步方法，不知道方法执行的先后顺序，所以需要用promise包装延后异步方法的执行
     * 1. promise(文件读取，resolve(读取token结果)，reject(失败err))
     *      .then(promise(url访问 + 读取token结果，resolve(url访问结果)，reject(失败err)))
     */
    return new Promise((resolve, reject) => {
      rp({
          url,
          method: "GET",
          json: true
        })
        .then(res => {
          // {
          //   access_token: '19_NyGT0svuoMQwQDTMh6mWWiLg5J73k9uQIrCgoucPhValVwyst1W48cGjrQ3aufJEwZkrgQZ1St6hdYe9yiZrYSjFWYKAJ7KbPyXsUE12N83avBJqccQ2OSKcgijIxG0w3Oi5G6uYoBPZ7DvhTIUbAFAXMY',
          //   expires_in: 7200
          // }
          /**
           * 设置accessToken的过期时间
           * 过期时延7200秒, 当前时间 + 7200 - 5 * 60 = 过期时间
           */
          res.expires_in = Date.now() + (res.expires_in - 300) * 1000
          resolve(res)
        })
        .catch(err => {
          reject("accessToken方法出了问题：" + err)
        })
    })
  }

  /**
   * 因为ticket和access_token都有文件读写的操作，所以把文件读写封装成方法并且调用
   * @param accessToken 
   */
  saveAccessToken(accessToken) {
    return writeFileAsync(accessToken, 'access_token.txt')
  }

  readAccessToken() {
    return readFileAsync('access_token.txt')
  }

  isValidAccessToken(data) {
    if (!data && !data.access_token && !data.expires_in) {
      // access_token无效
      return false
    }

    // 判断是否过期
    return data.expires_in > Date.now()
  }

  /**
   * 用来获取没有过期的access_token
   */
  fetchAccessToken3() {
    return new Promise((resolve, reject) => {
      this.readAccessToken()
        // 本地有文件
        .then(res => {
          if (this.isValidAccessToken()) {
            resolve(res)
          } else {
            // 过期了
            this.getAccessToken()
              .then(res => {
                // 保存accessToken
                this.saveAccessToken(res)
                  .then(() => {
                    resolve(res)
                  })
              })
          }
        })
        // 本地无文件
        .catch(err => {
          // 本地没文件，请求accessToken
          this.getAccessToken()
            .then(res => {
              // 保存accessToken
              this.saveAccessToken(res)
                .then(() => {
                  resolve(res)
                })
            })
        })
    }).then(res => {
      console.log(res)
    })
  }

  /**
   * async版本
   */
  fetchAccessToken2() {
    return new Promise(async (resolve, reject) => {
      this.readAccessToken()
        .then(async res => {
          // 本地有文件
          if (this.isValidAccessToken()) {
            resolve(res)
          } else {
            // 过期了
            let res = await this.getAccessToken()
            await this.saveAccessToken(res)
            // 将请求回来的access_token返回出去
            resolve(res)
          }
        })
        .catch(async err => {
          // 本地没有文件
          let res = await this.getAccessToken()
          await this.saveAccessToken(res)
          // 将请求回来的access_token返回出去
          resolve(res)
        })
    })
  }

  /**
   * 优化版本
   */
  fetchAccessToken() {
    if (this.access_token && this.expires_in && this.isValidAccessToken(this)) {
      // 说明之前保存过access_token，并且它是有效的
      return Promise.resolve({
        access_token: this.access_token,
        expires_in: this.expires_in
      })
    }
    // 是fetchAccessToken函数返回的对象
    return this.readAccessToken()
      // 本地有文件
      .then(async res => {
        if (this.isValidAccessToken(res)) {
          return Promise.resolve(res)
        } else {
          // 过期了
          let res = await this.getAccessToken()
          await this.saveAccessToken(res)
          // 将请求回来的access_token返回出去
          return Promise.resolve(res)
        }
      })
      // 本地没有文件
      .catch(async err => {
        // 本地有文件
        let res = await this.getAccessToken()
        await this.saveAccessToken(res)
        // 将请求回来的access_token返回出去
        return Promise.resolve(res)
      })
      .then(res => {
        // 将access_token挂载到this上
        this.access_token = res.access_token
        this.expires_in = res.expires_in
        /**
         * 返回res包装了一层promise对象(此对象为成功的状态)
         * 是this.readAccessToken()最终返回的对象
         */
        return Promise.resolve(res)
      })
  }

  /**
   * 用来创建自定义菜单
   * @param menu 菜单配置对象
   */
  createMenu(menu) {
    return new Promise(async (resolve, reject) => {
      /**
       * await async最大的不方便点是没有对reject的处理，得使用try,catch来处理异常
       */
      try {
        // 获取access_token
        let data = await this.fetchAccessToken()
        // 定义请求地址
        const url = `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${data.access_token}`
        //发送请求
        let result = await rp({
          method: "POST",
          url,
          json: true,
          body: menu
        })
        resolve(result)
      } catch (error) {
        reject(`createMenu方法出了问题：${error}`)
      }
    })
  }

  /**
   * 用来删除自定义菜单
   */
  deleteMenu() {
    return new Promise(async (resolve, reject) => {
      try {
        // 获取access_token
        let data = await this.fetchAccessToken()
        // 定义请求地址
        let url = `https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=${data.access_token}`
        // 发送请求
        let result = rp({
          method: "GET",
          url,
          json: true
        })
        resolve(result)
      } catch (error) {
        reject(`deleteMenu方法出了问题：${error}`)
      }
    })
  }


  /**
   * 用来获取jsapi_ticket(使用js-sdk)
   * 微信JS-SDK是微信公众平台 面向网页开发者提供的基于微信内的网页开发工具包。
   * 通过使用微信JS-SDK，网页开发者可借助微信高效地使用拍照、选图、语音、位置等手机系统的能力，
   * 同时可以直接使用微信分享、扫一扫、卡券、支付等微信特有的能力，为微信用户提供更优质的网页体验。
   */
  getTicket() {
    return new Promise(async (resolve, reject) => {
      const data = await this.fetchAccessToken()
      const url = `${api.ticket}&access_token=${data.access_token}`
      console.log(url)
      rp({
          url,
          method: "GET",
          json: true
        })
        .then(res => {
          /**
            {
              "errcode": 0,
              "errmsg": "ok",
              "ticket": "bxLdikRXVbTPdHSM05e5u5sUoXNKd8-41ZO3MhKoyN5OfkWITDGgnr2fwJ0m9E8NYzWKVZvdVtaUgWvsdshFKA",
              "expires_in": 7200
            }
           */
          resolve({
            ticket: res.ticket,
            expires_in: Date.now() + (res.expires_in - 300) * 1000
          })
        })
        .catch(err => {
          reject("getTicket方法出了问题：" + err)
        })
    })
  }

  saveTicket(ticket) {
    return writeFileAsync(ticket, 'ticket.txt')
  }

  readTicket() {
    return readFileAsync('ticket.txt')
  }

  isValidTicket(data) {
    if (!data && !data.ticket && !data.expires_in) {
      // ticket无效
      return false
    }

    // 判断是否过期
    return data.expires_in > Date.now()
  }

  fetchTicket() {
    if (this.ticket && this.ticket_expires_in && this.isValidTicket(this)) {
      // 说明之前保存过ticket，并且它是有效的
      return Promise.resolve({
        ticket: this.ticket,
        expires_in: this.expires_in
      })
    }
    // 是fetchTicket函数返回的对象
    return this.readTicket()
      // 本地有文件
      .then(async res => {
        if (this.isValidTicket(res)) {
          return Promise.resolve(res)
        } else {
          // 过期了
          let res = await this.getTicket()
          await this.saveTicket(res)
          // 将请求回来的ticket返回出去
          return Promise.resolve(res)
        }
      })
      // 本地没有文件
      .catch(async err => {
        // 本地有文件
        let res = await this.getTicket()
        await this.saveTicket(res)
        // 将请求回来的ticket返回出去
        return Promise.resolve(res)
      })
      .then(res => {
        // ticket
        this.ticket = res.ticket
        this.ticket_expires_in = res.expires_in
        /**
         * 返回res包装了一层promise对象(此对象为成功的状态)
         * 是this.readTicket()最终返回的对象
         */
        return Promise.resolve(res)
      })
  }
}

(async () => {
  // 模拟测试
  let w = new Wechat()
  // // 删除之前定义的菜单
  // let result = await w.deleteMenu()
  // console.log(result)
  // // 创建新的菜单
  // result = await w.createMenu(menu)
  // console.log(result)

  let data = await w.fetchTicket()
  console.log(data)
})()
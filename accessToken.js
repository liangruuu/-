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
const {
  writeFile,
  readFile
} = require('fs')

class wechat {
  constructor() {}
  /**
   * 用来获取access_token
   */
  getAccessToken() {
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`
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

  saveAccessToken(accessToken) {
    let accesstoken = JSON.stringify(accessToken)
    return new Promise((resolve, reject) => {
      writeFile('./accessToken.txt', accesstoken, err => {
        if (!err) {
          console.log("文件保存成功！")
          resolve()
        } else {
          reject('saveAccessToken方法除了问题：' + err)
        }
      })
    })
  }

  readAccessToken() {
    return new Promise((resolve, reject) => {
      readFile('./accessToken.txt', (err, data) => {
        if (!err) {
          let data = JSON.parse(data)
          console.log("文件读取成功！")
          resolve(data)
        } else {
          reject('readAccessToken方法除了问题：' + err)
        }
      })
    })
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
  fetchAccessToken() {
    return new Promise((resolve, reject) => {
      this.readAccessToken()
        .then(res => {
          // 本地有文件
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
  fetchAccessToken() {
    return new Promise((resolve, reject) => {
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
        .catch(err => {
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
    })
  }

  /**
   * 优化版本
   */
  fetchAccessToken() {
    if (this.access_token && this.expires_in && this.isValidAccessToken()) {
      // 说明之前保存过access_token，并且它是有效的
      return Promise.resolve({
        access_token: this.access_token,
        expires_in: this.expires_in
      })
    }
    // 是fetchAccessToken函数返回的对象
    return this.readAccessToken()
      .then(async res => {
        // 本地有文件
        if (this.isValidAccessToken()) {
          return Promise.resolve(res)
        } else {
          // 过期了
          let res = await this.getAccessToken()
          await this.saveAccessToken(res)
          // 将请求回来的access_token返回出去
          return Promise.resolve(res)
        }
      })
      .catch(err => {
        // 本地有文件
        if (this.isValidAccessToken()) {
          return Promise.resolve(res)
        } else {
          // 过期了
          let res = await this.getAccessToken()
          await this.saveAccessToken(res)
          // 将请求回来的access_token返回出去
          return Promise.resolve(res)
        }
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
}
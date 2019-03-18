/**
 * 工具函数包
 */
const {
  parseString
} = require('xml2js')
const {
  writeFile,
  readFile
} = require('fs')
const {
  resolve
} = require('path')

module.exports = {
  getUserDataAsync(req) {
    // 因为不知道什么时候回读取完数据，所以用promise封装方法延迟执行
    return new Promise((resolve, reject) => {
      let xmlData = ''
      req.on('data', data => {
        // 当流式数据传递过来时，会触发当前事件，会将数据注入到回调函数中
        xmlData += data.toString()
      })
      req.on('end', () => {
        // 当数据接收完毕时会触发end事件
        resolve(xmlData)
      })
    })
  },
  parseXMLAsync(xmlData) {
    return new Promise((resolve, reject) => {
      // 形参2：配置对象(trim:收尾去除空格)
      parseString(xmlData, {
        trim: true
      }, (err, data) => {
        if (!err) {
          resolve(data)
        } else {
          reject(`parseXMLAsync方法出了问题:${err}`)
        }
      })
    })
  },
  formatMessage(jsData) {
    let message = {}
    // 获取xml对象，并且判断数据是否是一个对象
    jsData = jsData.xml
    if (typeof jsData === 'object') {
      for (let key in jsData) {
        // 获取属性值
        let value = jsData[key]
        // 过滤空数据
        if (Array.isArray(value) && value.length > 0) {
          // 将合法的数据赋值到message对象上
          message[key] = value[0]
        }
      }
    }
    return message
  },
  writeFileAsync(data, fileName) {
    data = JSON.stringify(data)
    /**
     * 解析绝对路径，path中的resolve方法
     */
    let filePath = resolve(__dirname, fileName)
    return new Promise((resolve, reject) => {
      writeFile(filePath, data, err => {
        if (!err) {
          console.log("文件保存成功！")
          resolve()
        } else {
          reject('writeFileAsync方法出了问题：' + err)
        }
      })
    })
  },
  readFileAsync(fileName) {
    let filePath = resolve(__dirname, fileName)
    return new Promise((resolve, reject) => {
      readFile(filePath, (err, data) => {
        if (!err) {
          let jsData = JSON.parse(data)
          console.log("文件读取成功！")
          resolve(jsData)
        } else {
          reject('readFileAsync方法出了问题：' + err)
        }
      })
    })
  }
}
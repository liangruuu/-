const sha1 = require('sha1')
const config = require('./config')

module.exports = () => {
  return (req, res, next) => {
    const {
      signature,
      echostr,
      timestamp,
      nonce
    } = req.query
    const {
      token
    } = config
    const sha1Str = sha1([timestamp, token, nonce].sort().join(""))
    console.log(sha1Str)

    if (signature == sha1Str) {
      res.send(echostr)
    } else {
      res.send("err")
    }
  }
}
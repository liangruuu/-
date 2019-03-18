const mongoose = require('mongoose')
const Schema = mongoose.Schema
const theathersSchema = new Schema({
  title: String,
  rating: Number,
  runtime: String,
  directors: String,
  casts: String,
  image: String,
  doubanId: String,
  genre: [String],
  summary: String,
  releaseDate: String,
  postKey: String, // 图片上传到七牛中返回的key值
  createTime: {
    type: Date,
    default: Date.now()
  }
})

// 创建模型对象
const Theaters = mongoose.model('Theaters', theathersSchema)
module.exports = Theaters
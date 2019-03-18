/**
 * 爬取热门电影的爬虫
 */
const puppeteer = require('puppeteer')
const url = 'https://movie.douban.com/cinema/nowplaying/hangzhou/'

module.exports = async () => {
  /**
   * 1. 打开浏览器
   * 2. 创建tab标签页
   * 3. 跳转到指定网址
   * 4. 等待网址加载完成，开始爬取数据
   * 5. 关闭浏览器
   */
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    headless: true, // 以无头浏览器的方式打开浏览器，没有界面显示，在后台运行
  });
  const page = await browser.newPage();
  await page.goto(url, {
    waitUtil: 'networkidle2' // 在网络空闲时，再跳转加载页面
  });

  // 开启延时器，延时2秒再开始爬取数据(网络不好的情况下使用, 等网页css，js数据加载完)
  await timeout()
  const result = await page.evaluate(() => {
    // 对加载好的页面进行dom操作

    // 所有爬取好的数据数据
    const result = []

    // 获取所有热门电影的li
    let $list = $('#nowplaying>.mod-bd>.lists>.list-item')
    // 只取8条数据
    for (let i = 0; i < 8; i++) {
      let liDom = $list[i]
      let title = $(liDom).data('title')
      let rating = $(liDom).data('score')
      let runtime = $(liDom).data('duration')
      let directors = $(liDom).data('director')
      let casts = $(liDom).data('actors')
      let href = $(liDom).find('.poster>a').attr('href')
      let image = $(liDom).find('.poster>a>img').attr('src')
      result.push({
        title,
        rating,
        runtime,
        directors,
        casts,
        href,
        image
      })
    }

    // 将爬取好的数据返回出去
    return result
  })

  // console.log(result)

  // 遍历爬取到的8条数据
  for (let i = 0; i < result.length; i++) {
    // 获取每个条目信息
    let item = result[i]
    let url = item.href
    await page.goto(url, {
      waitUtil: 'networkidle2'
    })

    let itemResult = await page.evaluate(() => {
      let genre = []
      // 类型
      const $genre = $('[property="v:genre"]')
      for (let j = 0; j < $genre.length; j++) {
        genre.push($genre[j].innerText)
      }
      // 简介
      const summary = $('[property="v:summary"]').html().replace(/\s+/g,'')

      return {
        genre,
        summary
      }
    })

    /**
     * 在最后给当前对象添加两个属性
     * 因为在evaluate函数中没办法读取服务器中的变量
     */
    item.genre = itemResult.genre
    item.summary = itemResult.summary
  }


  console.log(result)

  await browser.close();
}

function timeout() {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 500)
  })
}
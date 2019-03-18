1. 使用爬虫框架puppeteer(Headless Chrome Node API )
  * 没有界面，说明跟这个浏览器是运行在后台的，但是实际上是在访问一个网页
  * 模拟打开浏览器的过程
  ```
  const puppeteer = require('puppeteer');

  (async () => {
    /**
     * 1. 打开浏览器
     * 2. 新建标签页
     * 3. 在该标签页上跳转到指定网址
     * 4. 爬取数据(该例子是截屏)
     * 5. 关闭浏览器 
    **/
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://example.com');
    await page.screenshot({path: 'example.png'});

    await browser.close();
  })();
  ```

2. 因为公众号默认最大现实条数为8条，所以每次爬取8条数据

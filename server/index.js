const db = require('../db')
const theatersCrawler = require('./crawler/theatersCrawler')
const saveTheaters = require('./save/saveTheaters')

;
(async () => {
  await db
  const data = await theatersCrawler()
  await saveTheaters(data)
})()
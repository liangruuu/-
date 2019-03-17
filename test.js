const fs = require('fs')

fs.readFile('jajaj.txt', (err, data) => {
  if (err)
    console.log("chucuole")
  else
    console.log("haixing")
})
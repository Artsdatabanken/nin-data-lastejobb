const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const fs = require("fs")

const REDIS = false
if (!REDIS) return

let data = io.lesDatafil("metabase_med_bbox")
const dest = fs.createWriteStream("metabase.redis")
Object.keys(data).forEach(key => {
  const value = JSON.stringify(data[key]).replace("'", "\\'")
  dest.write(`SET     ${key} '${value}'\n`)
})
dest.close()

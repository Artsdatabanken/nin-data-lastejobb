const config = require("./config")
const io = require("./lib/io")
const log = require("log-less-fancy")()

const base = "/home/grunnkart/tilesdata"

let data = io.lesBuildfil("metabase")
Object.keys(data).forEach(kode => {
  const node = data[kode]
  const sti = kode.split("-").join("/")
  //  console.log(`mkdir -p "${base}/${node.url}/"`)
  console.log(
    `cp ${base}/bilde/avatar/40/${kode}.jpg "${base}/${node.url}/avatar_40.jpg"`
  )
  console.log(
    `cp ${base}/bilde/avatar/40/${kode}.png "${base}/${node.url}/avatar_40.png"`
  )
})

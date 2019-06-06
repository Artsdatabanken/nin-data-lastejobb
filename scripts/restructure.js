const { io } = require("lastejobb")

const base = "/home/grunnkart/tilesdata"

let data = io.lesBuildfil("metabase")
Object.keys(data).forEach(kode => {
  const node = data[kode]
  const sti = kode.split("-").join("/")
  console.log(`mkdir -p "${base}/${node.url}/"`)
  console.log(`cp ${base}/${sti}/* "${base}/${node.url}/" || :`)
})

const fs = require("fs")
const base = "/home/grunnkart/tilesdata"

let data = JSON.parse(fs.readFileSync(process.argv[2]))
data.items.forEach(node => {
  const kode = node.kode
  if (kode === "meta") return
  const path = `${base}${node.url}`
  const fn = `${path}/metadata.json`
  if (!fs.existsSync(path)) {
    console.log("new type: ", path)
    fs.mkdirSync(path, { recursive: true })
  }
  fs.writeFileSync(fn, JSON.stringify(node))
})

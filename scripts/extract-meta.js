const fs = require("fs")
const base = "/home/grunnkart/tilesdata"

let data = JSON.parse(fs.readFileSync(process.argv[2]))
Object.keys(data).forEach(kode => {
  if (kode !== "meta") {
    const node = data[kode]
    const path = `${base}/${node.url}/`
    const fn = `${path}/metadata.json`
    if (!fs.existsSync(path)) {
      console.log("mkdir: ", path)
      fs.mkdirSync(path, { recursive: true })
    }
    fs.writeFileSync(fn, JSON.stringify(node))
  }
})

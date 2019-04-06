const fs = require("fs")
const path = require("path")
const execSync = require("child_process").execSync

const sourcePath = "./data/"
const destBasePath = "grunnkart@hydra:~/tilesdata"

let meta = JSON.parse(fs.readFileSync(process.argv[2]))
const files = fs.readdirSync(sourcePath)
files.forEach(filePath => {
  if (!filePath.endsWith(".palette.png")) return
  const fn = path.basename(filePath)
  const kode = fn.split(".")[0]

  const node = meta[kode]
  if (!node) return
  const destPath = `${destBasePath}/${node.url}/raster_indexed_palette.png`
  console.log(`scp ${sourcePath}/${filePath} ${destPath}`)
  execSync(`scp ${sourcePath}/${filePath} ${destPath}`)
})

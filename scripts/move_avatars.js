const { io } = require("@artsdatabanken/lastejobb")

const destBase = "/home/grunnkart/tilesdata"
const srcBase = "/home/grunnkart/staging/assets"

let data = io.lesBuildfil("metabase")
Object.keys(data).forEach(kode => {
  const node = data[kode]
  const sti = kode.split("-").join("/")
  //  console.log(`mkdir -p "${base}/${node.url}/"`)
  console.log(
    `cp ${srcBase}/bilde/avatar/40/${kode}.jpg "${destBase}/${
      node.url
    }/avatar_40.jpg"`
  )
  console.log(
    `cp ${srcBase}/bilde/avatar/40/${kode}.png "${destBase}/${
      node.url
    }/avatar_40.png"`
  )
})

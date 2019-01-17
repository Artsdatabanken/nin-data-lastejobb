const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()

const baseUrl = "https://maps.artsdatabanken.no/"

let full = io.lesDatafil("metabase_bbox")

Object.keys(full).forEach(kode => {
  const node = full[kode]
  node.foto = node.foto || {}
  node.foto.forside = {
    url: baseUrl + node.url + "/forside_408.jpg",
    lisens: "",
    opphav: "",
    utgiver: ""
  }
})

io.skrivDatafil(__filename, full)

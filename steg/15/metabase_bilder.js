const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()

const baseUrl = "https://maps.artsdatabanken.no/"

let full = io.lesDatafil("metabase_bbox")
let filindeks = io.lesDatafil("filindeks")

Object.keys(full).forEach(kode => {
  const node = full[kode]
  const fil = filindeks[node.url]
  node.foto = node.foto || {}
  if (!fil) return
  if (fil["forside_408.png"]) return
  node.foto.forside = {
    url: baseUrl + node.url + "/forside_408.jpg",
    lisens: "",
    opphav: "",
    utgiver: ""
  }
})

io.skrivDatafil(__filename, full)

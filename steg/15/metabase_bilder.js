const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()

const baseUrl = "https://maps.artsdatabanken.no/"

let full = io.lesDatafil("metabase_bbox")
let filindeks = io.lesDatafil("filindeks")

Object.keys(full).forEach(kode => {
  const node = full[kode]
  const filer = filindeks[node.url]
  node.foto = node.foto || {}
  if (!filer) return
  if (kode == "NN-NA") debugger
  const forside = filer["forside_408.jpg"] || filer["forside_408.png"]
  if (!forside) return
  node.foto.forside = {
    url: baseUrl + node.url + "/" + forside.filename,
    lisens: "",
    opphav: "",
    utgiver: ""
  }
})

io.skrivDatafil(__filename, full)

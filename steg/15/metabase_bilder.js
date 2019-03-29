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
  if (kode == "NN-LA-KLG-REIA") debugger
  add(filer, node, "forside", 408)
  add(filer, node, "banner", 950)
  // TODO: temp fallback
  if (!node.banner && node.forside) node.banner = node.forside
})

function add(filer, node, tag, width) {
  const basename = "forside_" + width
  const imgfile = filer[basename + ".jpg"] || filer[basename + ".png"]
  if (!imgfile) return
  node.foto[tag] = {
    url: baseUrl + node.url + "/" + imgfile.filename,
    lisens: "",
    opphav: "",
    utgiver: ""
  }
}

io.skrivDatafil(__filename, full)

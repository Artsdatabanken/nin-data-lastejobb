const { io } = require("lastejobb")
const path = require("path")

const baseUrl = "https://data.artsdatabanken.no/"

let full = io.lesDatafil("metabase_bbox")
let filindeks = io.lesDatafil("filindeks")

Object.keys(full).forEach(kode => {
  const node = full[kode]
  const filer = filindeks[node.url]
  node.foto = node.foto || {}
  if (!filer) return
  add(filer, node, "forside", 408)
  add(filer, node, "banner", 950)
  addKilde(node)
  addBilder(node, filer)
  // TODO: temp fallback
  if (!node.banner && node.forside) node.banner = node.forside
})

function addBilder(node, filer) {
  node.bilde = node.bilde || {}
  const bilde = node.bilde
  Object.keys(filer).forEach(fil => {
    const p = path.parse(fil)
    if (".png.jpg".indexOf(p.ext) < 0) return
    const parts = p.name.split("_")
    let [format, width] = parts
    switch (width) {
      case "40":
        format = "avatar"
        break
      case "408":
        format = "foto"
        break
      case "950":
        format = "banner"
        break
    }
    const mk = format
    bilde[mk] = bilde[mk] || {}
    bilde[mk].url = fil
  })
}

function addKilde(node) {
  node.bilde = node.bilde || {}
  const bilde = node.bilde
  if (!node.mediakilde) return
  Object.keys(node.mediakilde).forEach(mk => {
    let kilde = node.mediakilde[mk]
    if (Array.isArray(kilde)) kilde = kilde[0]
    if (!kilde) return
    bilde[mk] = bilde[mk] || {}
    bilde[mk].kildeurl = urlMedBildeOgMetadata(kilde)
  })
}

function urlMedBildeOgMetadata(url) {
  if (url.indexOf("commons.wikimedia.org") < 0) return url
  // https://www.wikidata.org/wiki/Q1789866#/media/File:Seierstad_J%C3%B8a.jpg
  // https://commons.wikimedia.org/wiki/File:Seierstad_J%C3%B8a.jpg#/media/File:Seierstad_J%C3%B8a.jpg
  const file = url.split("/").pop()
  return `https://commons.wikimedia.org/wiki/File:${file}#/media/File:${file}`
}

function add(filer, node, tag, width) {
  const basename = "forside_" + width
  const imgfile = filer[basename + ".jpg"] || filer[basename + ".png"]
  if (!imgfile) return
  node.foto[tag] = {
    url: baseUrl + node.url + "/" + imgfile.filename
  }
}

io.skrivDatafil(__filename, full)

const { io } = require("lastejobb")
const config = require("../../config")
const path = require("path")

const baseUrl = "https://data.artsdatabanken.no/"

let full = io.lesDatafil("metabase_bbox")
let filindeks = io.lesDatafil("filindeks")

Object.keys(full).forEach(kode => {
  const node = full[kode]
  node.bilde = node.bilde || {}
  const filer = filindeks[node.url]
  if (!filer) return
  add(filer, node, "foto", 408)
  add(filer, node, "banner", 950)
  add(filer, node, "logo", 40)
  addKilde(node)
  addBilder(node, filer)
  // TODO: temp fallback
  if (!node.banner && node.forside) node.banner = node.forside
})

function addBilder(node, filer) {
  const bilde = node.bilde
  Object.keys(filer).forEach(fil => {
    const p = path.parse(fil)
    if (".png.jpg".indexOf(p.ext) < 0) return
    const parts = p.name.split("_")
    let [format, width] = parts
    bilde[format] = bilde[format] || {}
    bilde[format].url = config.webserver + node.url + "/" + fil
  })
}

function addKilde(node) {
  const bilde = node.bilde
  if (!node.mediakilde) return
  Object.keys(node.mediakilde).forEach(mk => {
    let kilde = node.mediakilde[mk]
    if (Array.isArray(kilde)) kilde = kilde[0]
    if (!kilde) return
    bilde[mk] = bilde[mk] || {}
    bilde[mk].kilde = urlMedBildeOgMetadata(kilde)
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
  node.bilde = node.bilde || {}
  const basename = tag + "_" + width
  const imgfile = filer[basename + ".jpg"] || filer[basename + ".png"]
  if (!imgfile) return
  node.bilde[tag] = {
    url: baseUrl + node.url + "/" + imgfile.filename
  }
}

io.skrivDatafil(full)

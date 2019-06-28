const { io } = require("lastejobb")

const baseUrl = "https://data.artsdatabanken.no/"

let full = io.lesDatafil("metabase_bbox")
let filindeks = io.lesDatafil("filindeks")

Object.keys(full).forEach(kode => {
  const node = full[kode]
  node.bilde = node.bilde || {}
  const filer = filindeks[node.url]
  if (!filer) return
  addMedia(filer, node, "foto", 408)
  addMedia(filer, node, "banner", 950)
  addMedia(filer, node, "logo", 40)
  addMediaSource(node)
  // addBilder(node, filer)
  // TODO: temp fallback
})

function addMediaSource(node) {
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

function findFile(filer, name) {
  const e = filer[name]
  if (!e) return null
  return { filename: name, ...e }
}

function addMedia(filer, node, tag, width) {
  node.bilde = node.bilde || {}
  const basename = tag + "_" + width
  const imgfile =
    findFile(filer, basename + ".jpg") || findFile(filer, basename + ".png")
  if (!imgfile) return
  if (!imgfile.filename) debugger
  node.bilde[tag] = {
    url: baseUrl + node.url + "/" + imgfile.filename
  }
}

io.skrivDatafil(__filename, full)

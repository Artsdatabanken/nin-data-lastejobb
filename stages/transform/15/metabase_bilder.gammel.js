const { io } = require("lastejobb")

const baseUrl = "https://data.artsdatabanken.no/"

let full = io.lesTempJson("metabase_bbox")
let filindeks = io.lesTempJson("filindeks")

Object.keys(full).forEach(kode => {
  const node = full[kode]
  node.bilde = node.bilde || {}
  const rot = node.url.split("/")[1]
  const filer = filindeks[node.url.substring(1)] || {}
  if (!node.bilde.logo) node.bilde.logo = {}
  const harEgenLogo = !!filer["logo_24.png"]
  /*  node.bilde.logo.url = harEgenLogo
    ? baseUrl + node.url.substring(1) + "/logo_24.png"
    : baseUrl + rot + "/logo_24.png"
*/
  if (!filer) return
  addMedia(filer, node, "foto", 408)
  addMedia(filer, node, "banner", 950)
  addMediaSource(node)
})

function addMediaSource(node) {
  const bilde = node.bilde
  if (!node.mediakilde) return
  Object.keys(node.mediakilde).forEach(mk => {
    let kilde = node.mediakilde[mk]
    if (Array.isArray(kilde)) kilde = kilde[0]
    if (!kilde) return
    bilde[mk] = bilde[mk] || {}
    bilde[mk].kilde = urlMedBildeOgMetadata(kilde, node.url)
  })
  delete node.mediakilde
}

function urlMedBildeOgMetadata(url, nodeurl) {
  if (!url.startsWith("http")) {
    return nodeurl + "/" + url
  }
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

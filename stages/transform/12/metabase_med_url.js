const { io } = require("lastejobb")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

const usedUrls = {}

let tre = io.lesDatafil("metabase_tweaks")
Object.keys(tre).forEach(kode => addUrl(kode, tre[kode]))
Object.keys(tre).forEach(kode => addUrlPåRelasjoner(kode, tre[kode]))
Object.keys(tre).forEach(kode => oppdaterNivå(tre[kode]))
io.skrivDatafil(__filename, tre)

function oppdaterNivå(node) {
  oppdaterNivå1(node)
  const undernivå = typesystem.hentNivaa(node.url + "/x")
  if (undernivå) node.undernivå = undernivå[0]
  node.overordnet.forEach(ov => {
    oppdaterNivå1(ov)
  })
}

function oppdaterNivå1(node) {
  if (node.url === "Katalog") return
  node.nivå = node.nivå || typesystem.hentNivaa(node.url)[0]
}

function addUrl(kode, node) {
  if (!node.hasOwnProperty("url")) node.url = url(kode)
  if (usedUrls[node.url])
    log.warn("Dupe URL " + kode + "," + usedUrls[node.url] + ": " + node.url)
  usedUrls[node.url] = kode
  if (node.media && node.media.kart) {
    node.media.kart = node.url + node.media.kart
  }
}

function addUrlPåRelasjoner(kode, node) {
  urlPåGraf(node)
  urlPåGradient(node)
  urlPåFlagg(node)
}

function urlPåGraf(node) {
  if (!node.graf) return
  const grafArray = []
  Object.keys(node.graf).forEach(typeRelasjon => {
    const tr = { type: typeRelasjon, noder: [] }
    Object.keys(node.graf[typeRelasjon]).forEach(kode => {
      const sub = node.graf[typeRelasjon][kode]
      sub.kode = kode
      sub.url = url(kode)
      tr.noder.push(sub)
    })
    grafArray.push(tr)
  })
  node.graf = grafArray
}

function urlPåGradient(node) {
  if (!node.gradient) return
  Object.keys(node.gradient).forEach(domenekode => {
    const domenenode = node.gradient[domenekode]
    domenenode.url = url(domenekode)
    Object.keys(domenenode.barn).forEach(gradientkode => {
      const gradientnode = domenenode.barn[gradientkode]
      gradientnode.url = url(gradientkode)
      gradientnode.trinn.forEach(trinn => {
        trinn.url = url(trinn.kode)
      })
    })
  })
}

function urlPåFlagg(node) {
  if (!node.flagg) return
  Object.keys(node.flagg).forEach(kode => {
    node.flagg[kode].url = tre[kode].url
  })
}

function urlify(tittel, kode, makevalid) {
  let s = kode.startsWith(typesystem.art.prefiks)
    ? tittel.sn || tittel.nb
    : tittel.nb
  if (!s) {
    log.error("Mangler tittel: " + kode + ": " + JSON.stringify(tittel))
    return kode
  }

  let url = s.replace(/[\/:\s]/g, "_")
  if (makevalid) {
    url = url.replace("%", "_prosent")
    url = url.replace("__", "_")
  }
  return url
}

function url(kode) {
  if (!tre[kode]) debugger
  if (tre[kode].url) return tre[kode].url
  const node = tre[kode]
  if (!node.overordnet) {
    log.error(kode, JSON.stringify(node))
    throw new Error("Mangler overordnet: " + kode)
  }
  node.overordnet.forEach(node => (node.url = url(node.kode)))
  let sti = node.overordnet.slice(0, -1).map(f => f.tittel)
  sti = sti.reverse()
  sti.push(node.tittel)
  //  const oldUrl = sti.map(e => urlify(e, kode, false)).join("/")
  const newUrl = sti.map(e => urlify(e, kode, true)).join("/")
  //  if (oldUrl !== newUrl) log.info("mv ", oldUrl, newUrl)
  //if (oldUrl !== newUrl) mods += `\nmv "${oldUrl}" "${newUrl}"`
  return newUrl
}

//fs.writeFileSync("rename.sh", mods)

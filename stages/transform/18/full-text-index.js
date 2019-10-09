const { io, log } = require("lastejobb")

// Bygger fulltext-index for lookup-api

const tre = io.lesBuildfil("metabase").items
const index = {}

/*
[
  {"kode": "OR", "url": "Natur_i_Norge/Datakilde", "title": "Datakilder"},
  {"kode": "LA", "url": "Natur_i_Norge/Landskap", "title": "Landskap"}
]

*/

function push(hit, score, text) {
  if (!text) return
  if (typeof text !== "string") {
    return log.warn("Ugyldig kriterie:", hit, JSON.stringify(text))
  }
  if (!hit.kode) throw new Error("Mangler kode")
  if (!index[hit.kode]) index[hit.kode] = { hit: hit, text: {} }
  const item = index[hit.kode]
  score = parseInt(1000 * score)
  if (!score) throw new Error("Mangler score")
  if (!item.text[score]) item.text[score] = []
  item.text[score].push(text)
}

function overordnet(hit, array, score) {
  if (!array || array.length < 2) return
  const node = array.shift()
  if (!node) return
  push(hit, score, node.kode)
  pushAlleSpråk(hit, score, node.tittel)
  overordnet(hit, array, score * 0.9)
}

function pushAlleSpråk(hit, score, tittel) {
  if (!tittel) return
  Object.values(tittel).forEach(text => push(hit, score, text))
}

tre.forEach(node => {
  const kode = node.kode
  if (!node.tittel) debugger
  const hit = {
    kode: node.kode,
    url: node.url,
    title: node.tittel.nb || node.tittel.sn
  }
  let dybde = node.overordnet.length + 1
  if (kode.match(/LKM|KLG/)) dybde -= 0.5 // Boost gradientene som går igjen som byggeklosser på samme nivå i typene
  if (kode.startsWith("VV")) dybde += 3 // Nedprioriter verneområder
  const cf = Math.pow(0.99, dybde)
  push(hit, 1.0 * cf, node.kode)
  pushAlleSpråk(hit, 0.98 * cf, node.tittel)
  push(hit, 0.5 * cf, node.nivå)
  pushAlleSpråk(hit, 0.7 * cf, node.ingress)
  overordnet(hit, node.overordnet, 0.7 * cf)
  node.graf &&
    node.graf.forEach(gn => {
      push(hit, 0.3 * cf, gn.type)
      gn.noder.forEach(gnc => {
        push(hit, 0.7 * cf, gnc.kode)
        pushAlleSpråk(hit, 0.7 * cf, gnc.tittel)
      })
    })
})

io.skrivBuildfil(__filename, index)

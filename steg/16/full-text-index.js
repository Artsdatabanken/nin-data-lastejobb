const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

// Bygger fulltext-index for lookup-api

const tre = io.lesBuildfil("metabase")
const index = {}

/*
[
  {"kode": "OR", "url": "Natur_i_Norge/Datakilde", "title": "Datakilder"},
  {"kode": "LA", "url": "Natur_i_Norge/Landskap", "title": "Landskap"}
]

*/

function push(hit, score, text) {
  if (!text) return
  if (!index[hit.kode]) index[hit.kode] = { hit: hit, text: {} }
  const item = index[hit.kode]
  score = parseInt(100 * score)
  if (!item.text[score]) item.text[score] = []
  item.text[score].push(text)
}

function overordnet(hit, array, score) {
  if (!array || array.length < 2) return
  const node = array.shift()
  if (!node) return
  push(hit, score, node.kode)
  push(hit, score, node.tittel.nb)
  overordnet(hit, array, score * 0.9)
}

Object.keys(tre).forEach(kode => {
  const node = tre[kode]
  const hit = { kode: node.kode, url: node.url, title: node.tittel.nb }
  const cf = Math.pow(0.99, node.overordnet.length + 1)
  push(hit, 1.0 * cf, node.kode)
  push(hit, 1.0 * cf, node.tittel.nb)
  push(hit, 0.5 * cf, node.nivå)
  push(hit, 0.7 * cf, node.ingress)
  overordnet(hit, node.overordnet, 0.7 * cf)
  node.graf &&
    node.graf.forEach(gn => {
      push(hit, 0.3 * cf, gn.type)
      gn.noder.forEach(gnc => {
        push(hit, 0.7 * cf, gnc.kode)
        push(hit, 0.7 * cf, gnc.tittel.nb)
      })
    })
})

io.skrivBuildfil(__filename, index)

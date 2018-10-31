const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

let data = io.lesDatafil("full")

var p2c = {},
  c2p = {}

function mapForelderTilBarn(kode, node) {
  if (!c2p[kode]) c2p[kode] = []
  if (!node.foreldre) {
    if (!node.se) {
      throw new Error("Mangler forelder: " + kode)
    }
    return
  } else {
    let foreldre = node.foreldre
    foreldre.forEach(forelderkode => {
      if (!p2c[forelderkode]) p2c[forelderkode] = []
      p2c[forelderkode].push(kode)
      if (!c2p[kode].includes(forelderkode)) c2p[kode].push(forelderkode)
    })
    if (node.barn)
      node.barn.forEach(barnkode => {
        if (!p2c[kode]) p2c[kode] = []
        if (!c2p[barnkode]) c2p[barnkode] = []
        if (!c2p[barnkode].includes(kode)) c2p[barnkode].push(kode)
        if (!p2c[kode].includes(barnkode)) c2p[kode].push(barnkode)
        p2c[kode].push(barnkode)
      })
  }
}

function mapForeldreTilBarn() {
  Object.keys(data).forEach(kode => {
    const node = data[kode]
    mapForelderTilBarn(kode, node)
  })
}

mapForeldreTilBarn()

const hierarki = { barn: p2c, foreldre: c2p }
io.skrivDatafil(__filename, hierarki)

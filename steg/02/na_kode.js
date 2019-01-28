const io = require("../../lib/io")
const config = require("../../config")
let alleKoder = io.lesKildedatafil("Natur_i_Norge/Natursystem/na").data
let ingress = io.lesKildedatafil("Natur_i_Norge/Natursystem/na_ingress")

function kodefix(kode) {
  if (!kode) return kode
  return kode.toUpperCase().replace(" ", "-")
}

function importerKoder() {
  const mineKoder = {}
  for (let node of alleKoder) {
    const kode = kodefix(node.Kode.Id)
    let o = { tittel: { nb: node.Navn } }
    if (ingress[kode]) o.ingress = ingress[kode]
    mineKoder["NN-" + kode] = o
  }
  return mineKoder
}

const koder = importerKoder()
io.skrivDatafil(__filename, koder)

const io = require("../../lib/io")
const config = require("../../config")
let alleKoder = io.lesKildedatafil(config.datakilde.na_koder).data
let ingress = io.lesKildedatafil(
  "Natur_i_Norge/Natursystem/Typeinndeling/beskrivelse"
)

function kodefix(kode) {
  if (!kode) return kode
  const frags = kode.toUpperCase().split(" ")
  if (frags.length < 2) return "NN-NA-TI"
  return "NN-NA-TI-" + frags.pop()
}

function importerKoder() {
  const mineKoder = {}
  for (let node of alleKoder) {
    const kode = kodefix(node.Kode.Id)
    let o = { tittel: { nb: node.Navn } }
    if (ingress[kode]) o.ingress = ingress[kode]
    mineKoder[kode] = o
  }
  return mineKoder
}

const koder = importerKoder()
io.skrivDatafil(__filename, koder)

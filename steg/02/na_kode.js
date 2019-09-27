const { io } = require("lastejobb")
const config = require("../../config")
let alleKoder = io.readJson("./nin-data/" + config.datakilde.na_koder + ".json")
  .data
let ingress = io.readJson(
  "./nin-data/Natur_i_Norge/Natursystem/Typeinndeling/beskrivelse.json"
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
    const ingresskode = node.Kode.Id.replace(" ", "-")
    let o = { tittel: { nb: node.Navn } }
    if (ingress[ingresskode]) o.ingress = ingress[ingresskode]
    mineKoder[kode] = o
  }
  return mineKoder
}

const koder = importerKoder()
io.skrivDatafil(__filename, koder)

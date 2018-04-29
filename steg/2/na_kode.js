const io = require("../../lib/io")
const config = require("../../config")
const typesystem = require("@artsdatabanken/typesystem")

let alleKoder = io.lesDatafil("inn_na")
let ingress = io.lesKildedatafil("na_ingress")

function kodefix(kode) {
  if (!kode) return kode
  return kode.toUpperCase().replace(" ", "_")
}

function importerKoder() {
  const mineKoder = {}
  for (let node of alleKoder) {
    const kode = kodefix(node.Kode.Id)
    let o = { tittel: { nb: typesystem.capitalizeTittel(node.Navn) } }
    if (ingress[kode]) o.ingress = ingress[kode]
    mineKoder[kode] = o
  }
  return mineKoder
}

const koder = importerKoder()
io.skrivDatafil(__filename, koder)

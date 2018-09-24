const io = require("../../lib/io")
const config = require("../../config")
const log = require("log-less-fancy")()

let koder = io.lesKildedatafil("mi")

function kodefix(kode) {
  if (!kode) return kode
  kode = kode.toUpperCase()
  if (kode.indexOf("BESYS") === 0)
    return kode.replace("BESYS", "BS_").replace("BS_0", "BS")
  if (kode === "LKM") return "MI"
  if ("0123456789".indexOf(kode[0]) < 0) return "MI_" + kode
  return "BS_" + kode
}

let kodeliste = {}

function importerKoder() {
  const mineKoder = {}
  for (let key of Object.keys(koder)) {
    const node = koder[key]
    const kode = kodefix(node.Kode.Id)
    if (kode === "MI") node.Navn = "Miljøvariabel"
    const tittel = node.Navn
    let o = {
      tittel: { nb: tittel }
    }
    mineKoder[kode] = o
  }
  return mineKoder
}

const imp = importerKoder()
io.skrivDatafil(__filename, imp)

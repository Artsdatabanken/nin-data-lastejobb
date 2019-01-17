const io = require("../../lib/io")
const config = require("../../config")
const log = require("log-less-fancy")()

let koder = io.lesKildedatafil("mi")

function kodefix(kode) {
  if (!kode) return null
  kode = kode.toUpperCase().replace("_", "-")
  if (kode.indexOf("BESYS") === 0)
    return kode.replace("BESYS", "NA-BS-").replace("BS0", "BS")
  if (kode === "LKM") return "NA-LKM"
  if ("0123456789".indexOf(kode[0]) < 0) return "NA-LKM-" + kode
  return "NA-BS-" + kode
}

let kodeliste = {}

function importerKoder() {
  const mineKoder = {}
  for (let key of Object.keys(koder)) {
    const node = koder[key]
    const kode = kodefix(node.Kode.Id)
    if (kode === "NA-LKM") node.Navn = "Lokale komplekse miljøvariabler"
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

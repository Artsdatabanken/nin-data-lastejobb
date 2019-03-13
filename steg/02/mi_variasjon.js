const io = require("../../lib/io")
const config = require("../../config")
const log = require("log-less-fancy")()

let koder = io.lesKildedatafil(
  "Natur_i_Norge/Natursystem/Lokale_komplekse_miljøvariabler/mi"
).data

function kodefix(kode) {
  if (!kode) return null
  kode = kode.toUpperCase()
  kode = kode.replace("_", "-")
  kode = kode.replace("–", "-")

  if (kode.indexOf("BESYS") === 0)
    return kode.replace("BESYS", "NN-NA-BS-").replace("BS0", "BS")
  if (kode === "LKM") return "NN-NA-LKM"
  if ("0123456789".indexOf(kode[0]) < 0) return "NN-NA-LKM-" + kode
  return "NN-NA-BS-" + kode
}

let kodeliste = {}

function importerKoder() {
  const mineKoder = {}
  for (let key of Object.keys(koder)) {
    const node = koder[key]
    const kode = kodefix(node.Kode.Id)
    const tittel = node.Navn
    let o = {
      tittel: { nb: tittel }
    }
    mineKoder[kode] = o
  }
  return mineKoder
}

const imp = importerKoder()
imp["NN-NA-LKM"].tittel.nb = "Lokale komplekse miljøvariabler"

io.skrivDatafil(__filename, imp)

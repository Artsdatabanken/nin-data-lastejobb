const { io } = require("lastejobb")

let koder = io.readJson(
  "nin-data/Natur_i_Norge/Natursystem/kodeliste_v2b_variasjon.json"
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
imp["NN-NA-LKM"].tittel.nb = "Miljøvariabler"

io.skrivDatafil(__filename, imp)

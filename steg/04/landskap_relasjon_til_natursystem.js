const log = require("log-less-fancy")()
const { io } = require("lastejobb")

let rel = io.lesDatafil("relasjon_til_natursystem.csv.json").items
let klg = io.lesDatafil("landskapsgradient.json")

const data = akkumuler(rel)
const r = map(data)

function akkumuler(rel) {
  const r = []
  rel.forEach(e => {
    const kode = mapklgkode(e.Gradient)
    if (!klg[kode]) return log.warn("Ukjent KLG " + kode)
    const keys = Object.keys(e)
    const relasjon = {}
    for (let i = 0; i < keys.length; i++) {
      let kant = keys[i]
      const mål = e[kant].split(",")
      kant = kant.toLowerCase()
      if (kant.trim().length <= 0) continue
      if (kant.toLowerCase() === "gradient") continue
      mål.forEach(m => {
        const målkode = mapnakode(m)
        if (!målkode) return
        if (!relasjon[kant]) relasjon[kant] = {}
        relasjon[kant][målkode] = true
      })
    }
    r.push({ kode: kode, lenker: relasjon })
  })
  return r
}

function map(data) {
  const r = {}
  data.forEach(e => {
    const { kode, lenker } = e
    const node = { relasjon: [] }
    Object.entries(lenker).forEach(([kant, målkoder]) => {
      Object.keys(målkoder).forEach(målkode =>
        node.relasjon.push({
          kode: målkode,
          kant: mapkant(kant),
          kantRetur: mapkantretur(kant)
        })
      )
      r[kode] = node
    })
  })
  return r
}

function mapklgkode(kode) {
  kode = kode.replace("RE-", "RE")
  kode = kode.replace("REID", "REIDKF")
  kode = kode.replace("REKF", "REIDKF")
  kode = kode.replace("AI-KS", "AIKS")
  return "NN-LA-KLG-" + kode
}

function mapnakode(kode) {
  kode = kode.trim()
  if (!kode) return
  kode = kode.replace("–", "-")
  kode = kode.replace("RE-IA", "REIA")
  kode = kode.replace("NA-", "NN-NA-TI-")
  kode = kode.replace("BS-", "NN-NA-BS-")
  return kode
}

function mapkant(kant) {
  kant = kant.replace(/\(.*\)_na/, "landskapselement")
  kant = kant.replace(/\(.*\)_bs3/, "landskapselement")
  kant = kant.replace(
    "gradient-tyngdepunkt-landskapselement landskapselement",
    "gradient-tyngdepunkt for landskapselement"
  )
  return capitalizeFirstLetter(kant.trim())
}

function mapkantretur(kant) {
  kant = kant.replace(/\(.*\)_na/, "i landskap")
  kant = kant.replace(/\(.*\)_bs3/, "i landskap")
  kant = kant.replace(
    "gradient-tyngdepunkt-landskapselement",
    "gradient-tyngdepunkt"
  )
  return capitalizeFirstLetter(kant.trim())
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

io.skrivDatafil(__filename, r)

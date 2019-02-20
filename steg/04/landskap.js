const config = require("../../config")
const io = require("../../lib/io")
const typesystem = require("@artsdatabanken/typesystem")

let hovedtyper = io.lesDatafil("landskap.csv.json")
let klg = io.lesDatafil("landskapsgradient.json")

const r = {}

function hack(kode) {
  kode = kode.replace("RE-", "RE")
  kode = kode.replace("ID-KF", "IDKF")
  kode = kode.replace("AI-KS", "AIKS")
  return "NN-LA-" + kode.split("_").join("-")
}

hovedtyper.forEach(e => {
  const ny = {
    tittel: { nb: e.name, en: e.field7 },
    relasjon: []
  }
  if (e.kortnavn) ny.tittel_kort = e.kortnavn
  const klger = {}
  Object.keys(e).forEach(key => {
    if (key.startsWith("klg_")) {
      const verdi = e[key]
      if (verdi && parseInt(verdi.split("-").pop()) > 0) {
        const kode = hack(verdi)
        klger[kode.substring(0, kode.length - 2)] = kode
        ny.relasjon.push({
          kode: hack(verdi),
          kant: "definert av",
          kantRetur: "definerer",
          erSubset: true
        })
      }
    }
  })
  ny.ingress = e.beskrivelse
  if (!ny.ingress && e.rekkefølge_kjeding_klg)
    ny.ingress = kjedGradientbeskrivelser(e.rekkefølge_kjeding_klg, klger)
  ny.pred_lnr = e.pred_lnr
  const menneskeligPåvirkning =
    e.naturlandskap === 1 ? "NN-LA-MP-NL" : "NN-LA-MP-KL"
  ny.relasjon.push({
    kode: menneskeligPåvirkning,
    kant: "menneskelig påvirkning",
    kantRetur: "består av",
    erSubset: true
  })
  let kode = e.s_kode.substring(0, 4)
  if (e.s_kode.length > 4) kode += "-" + e.s_kode.substring(4)
  if (kode.startsWith("LA-K-F"))
    ny.ingress = ny.ingress.replace(/dallandskap/g, "fjordlandskap")
  r["NN-" + kode] = ny
})

function kjedGradientbeskrivelser(rekkefølge, klger) {
  const koder = rekkefølge.split(",")
  return koder
    .map(k => {
      const kode = hack(k)
      const klgkode = klger[kode]
      if (!klgkode) return
      if (!klg[klgkode]) throw new Error("Ukjent klg " + klgkode)
      return klg[klgkode]._beskrivelse
    })
    .join(" ")
    .trim()
}

io.skrivDatafil(__filename, r)

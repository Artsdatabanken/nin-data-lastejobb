const { io } = require("lastejobb")

let hovedtyper = io.lesDatafil("landskap.csv.json").items
let klg = io.lesDatafil("landskapsgradient.json")

const r = {}

function hack(kode) {
  kode = kode.replace("RE-", "RE")
  kode = kode.replace("ID-KF", "IDKF")
  kode = kode.replace("AI-KS", "AIKS")
  kode = kode.split("_").join("-")
  if (kode.startsWith("KLG")) return "NN-LA-" + kode
  return "NN-LA-TI-" + kode.replace("LA-", "")
}

hovedtyper.forEach(e => {
  const ny = {
    tittel: { nb: e.Name, en: e.Name_EN },
    relasjon: []
  }
  if (e.Kortnavn) ny.tittel_kort = e.Kortnavn
  const klger = {}
  Object.keys(e).forEach(key => {
    if (key.startsWith("KLG_")) {
      const verdi = e[key]
      if (verdi && parseInt(verdi.split("-").pop()) > 0) {
        const kode = hack(verdi)
        klger[kode.substring(0, kode.length - 2)] = kode
        ny.relasjon.push({
          kode: hack(verdi),
          kant: "Landskapsgradient",
          kantRetur: "Landskapstype",
          erSubset: true
        })
      }
    }
  })
  ny.ingress = e.Beskrivelse
  if (!ny.ingress && e.rekkefølge_kjeding_klg)
    ny.ingress = kjedGradientbeskrivelser(e.rekkefølge_kjeding_klg, klger)
  ny.pred_lnr = e.Pred_Lnr
  const menneskeligPåvirkning =
    e.Naturlandskap === 1 ? "NN-LA-TI-AP-NL" : "NN-LA-TI-AP-AL"
  ny.relasjon.push({
    kode: menneskeligPåvirkning,
    kant: "menneskelig påvirkning",
    kantRetur: "består av",
    erSubset: true
  })
  let kode = e.S_kode.substring(0, 4)
  if (e.S_kode.length > 4) kode += "-" + e.S_kode.substring(4)
  if (kode.startsWith("LA-K-F"))
    ny.ingress = ny.ingress.replace(/dallandskap/g, "fjordlandskap")
  r[hack(kode)] = ny
})

function kjedGradientbeskrivelser(rekkefølge, klger) {
  const koder = rekkefølge.split(",")
  return koder
    .map(k => {
      const kode = hack(k)
      const klgkode = klger[kode]
      if (!klgkode) return
      if (!klg[klgkode]) throw new Error("Ukjent klg " + klgkode)
      return klg[klgkode].ingress
    })
    .join(" ")
    .trim()
}

io.skrivDatafil(__filename, r)

const config = require("../../config")
const typesystem = require("@artsdatabanken/typesystem")
const io = require("../../lib/io")
const log = require("log-less-fancy")()

const r = {}
flett("vv_naturvernområde")
flett("inn_ao_fylke")
flett("inn_ao_kommune")
flett("ao_naturvernområde")
flett("organisasjon")
flett("ar_diagnostisk_art")
flett("na_med_basistrinn_relasjon")
flett("na_mi_liste")
flett("mi_variasjon")
flett("landskap")
flett("landskapsgradient")
flett("landskap_relasjon_natursystem")
flett("ar_taxon")
flett("na_prosedyrekategori")
flett("na_definisjonsgrunnlag")
flett("inn_statistikk")
flettKildedata("rl_rødliste")
flettKildedata("Art/typer")
flettKildedata("Art/Fremmed_Art/typer")
flettKildedata("Fylke/typer")
flettKildedata("Natur_i_Norge/Landskap/typer")
flettKildedata("Natur_i_Norge/Natursystem/typer")
flettKildedata(
  "Natur_i_Norge/Natursystem/Lokale_komplekse_miljøvariabler/typer"
)
flettKildedata(
  "Natur_i_Norge/Natursystem/Beskrivelsessystem/Regional_naturvariasjon/typer"
)
flettKildedata("Naturvernområde/typer")
flettKildedata("typer")
sjekkAtTitlerEksisterer()
capsTitler()
kobleForeldre()
overrideDefects()
propagerNedFlaggAttributt()

// På sedimentsortering er det innført et ekstra tullenivå som bryter med systemet
// For å unngå en heap av trøbbel justerer vi kodene inn rett under LKM og dropper
// mellomnivået
function overrideDefects() {
  const koder = ["NN-NA-LKM-S3-E", "NN-NA-LKM-S3-F", "NN-NA-LKM-S3-S"]
  Object.keys(r).forEach(kode => {
    const node = r[kode]
    koder.forEach(m => {
      if (node.relasjon) {
        const node = r[kode]
        node.relasjon.forEach(rel => {
          rel.kode = rel.kode.replace("NN-NA-LKM-S3-", "NN-NA-LKM-S3")
        })
      }
      if (!kode.startsWith(m)) return
      const destKode = kode.replace("S3-", "S3")
      node.foreldre[0] = kode === m ? "NN-NA-LKM" : m.replace("S3-", "S3")
      r[destKode] = node
      delete r[kode]
    })
  })
  delete r["NN-NA-LKM-S3"]
}

function flettAttributter(o, props = {}) {
  for (let key of Object.keys(o)) {
    let kode = key.replace("_", "-")
    kode = kode.toUpperCase()
    const node = Object.assign({}, r[kode], o[key], props)
    r[kode] = node
  }
}

function flett(filename, props = {}) {
  var data = io.lesDatafil(filename)
  flettAttributter(data, props)
}

function flettKildedata(filename, props = {}) {
  var data = io.lesKildedatafil(filename)
  flettAttributter(data, props)
}

function finnForeldre(kode) {
  if (kode === typesystem.rotkode) return []
  const segs = typesystem.splittKode(kode)
  if (segs.length <= 1) return [typesystem.rotkode]
  const len = segs[segs.length - 1].length
  kode = kode.substring(0, kode.length - len)
  while (kode.length > 0) {
    if (kode in r) return [kode]
    kode = kode.substring(0, kode.length - 1)
  }
  return [typesystem.rotkode]
}

function kobleForeldre() {
  for (let key of Object.keys(r)) {
    const node = r[key]
    if (!node.foreldre) node.foreldre = finnForeldre(key)
  }
}

function propagerNedFlaggAttributt() {
  for (let kode of Object.keys(r)) {
    const node = r[kode]
    for (const fkode of node.foreldre) {
      if (r[fkode].type === "flagg") node.type = "flagg"
      if (r[fkode].type === "gradient") node.type = "gradientverdi"
    }
    if (kode.startsWith("NN-NA-LKM"))
      if (!node.type) log.warn("Missing type attribute on: " + kode)
  }
}

function capsTitler() {
  for (let key of Object.keys(r)) {
    const tittel = r[key].tittel
    Object.keys(tittel).forEach(lang => {
      let tit = tittel[lang].replace(/\s+/g, " ") // Fix double space issues in source data
      if (tit) tittel[lang] = tit.replace(tit[0], tit[0].toUpperCase())
      else log.warn("Mangler tittel: ", key)
    })
  }
}

function sjekkAtTitlerEksisterer() {
  const notitle = []
  for (let key of Object.keys(r)) {
    const node = r[key]
    if (!node.se) {
      if (!node.tittel) {
        log.warn(`Mangler tittel for ${key}: ${JSON.stringify(node)}`)
        notitle.push(key)
      } else {
        node.tittel = Object.entries(node.tittel).reduce((acc, e) => {
          if (!e[1])
            log.warn(`Mangler tittel for ${key}: ${JSON.stringify(node)}`)
          acc[e[0]] = e[1].trim()
          return acc
        }, {})
        if (r[key].kode) {
          debugger
          log.warn("Har kode: ", key)
        }
      }
    }
  }

  if (notitle.length > 0) {
    log.warn("Mangler tittel: " + notitle.join(", "))
    notitle.forEach(key => delete r[key])
  }
}

io.skrivDatafil(__filename, r)

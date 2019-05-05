const typesystem = require("@artsdatabanken/typesystem")
const { io, json, log } = require("lastejobb")

const r = {}

flett("naturvernområde")
flett("naturvern_typer")
flettKildedata("kommune/kommune")
flettKildedata("kommune/fylke")
flett("organisasjon")
flett("ar_diagnostisk_art")
flett("na_med_basistrinn_relasjon")
flett("na_mi_liste")
flett("mi_variasjon")
flett("landskap")
flett("landskapsgradient")
flett("landskap_relasjon_til_natursystem")
flett("ar_taxon")
flett("na_prosedyrekategori")
flett("na_definisjonsgrunnlag")
flett("inn_statistikk")
flettKildedataOld("rl_rødliste")
flettKildedataOld("Art/type")
flettKildedataOld("Art/Fremmed_Art/type")
flettKildedataOld("Fylke/type")
flettKildedata("nin-data/Natur_i_Norge/Landskap/Typeinndeling/type")
flettKildedata("nin-data/Natur_i_Norge/Natursystem/type")
flettKildedata("nin-data/Natur_i_Norge/Natursystem/Miljøvariabler/type")
flettKildedata(
  "nin-data/Natur_i_Norge/Natursystem/Beskrivelsessystem/Regional_naturvariasjon/type"
)
flettKildedataOld("Naturvernområde/type")
flettKildedataOld("type")
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
      json.moveKey(r, kode, destKode)
    })
  })
  delete r["NN-NA-LKM-S3"]
}

function flettAttributter(o, props = {}) {
  for (let key of Object.keys(o)) {
    let kode = key.replace("_", "-")
    kode = kode.toUpperCase()
    const src = o[key]

    // TEMP HACK
    json.moveKey(src, "navn", "tittel")
    if (src.tittel) {
      if (!src.tittel.nb && src.tittel.nob)
        json.moveKey(src.tittel, "nob", "nb")
    }
    const node = Object.assign({}, r[kode], src, props)
    r[kode] = node
  }
}

function flett(filename, props = {}) {
  var data = io.lesDatafil(filename)
  let o = data
  if (o.items) o = json.arrayToObject(data.items, { uniqueKey: "kode" })
  flettAttributter(o, props)
}

function flettKildedata(filename, props = {}) {
  var data = io.readJson(filename + ".json")
  let o = data
  if (o.items) o = json.arrayToObject(data.items, { uniqueKey: "kode" })
  flettAttributter(o, props)
}
function flettKildedataOld(filename, props = {}) {
  var data = io.readJson("./kildedata/" + filename + ".json")
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
      const foreldernode = r[fkode]
      if (!foreldernode)
        throw new Error(`Forelderen ${fkode} til ${kode} mangler.`)
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

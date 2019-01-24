const config = require("../../config")
const typesystem = require("@artsdatabanken/typesystem")
const io = require("../../lib/io")
const log = require("log-less-fancy")()

const r = {}

function flettAttributter(o, props = {}) {
  for (let key of Object.keys(o)) {
    const kode = key.replace("_", "-")
    r[kode] = Object.assign({}, r[kode], o[key], props)
  }
}

function flett(filename, props = {}) {
  var data = io.lesDatafil(filename)
  flettAttributter(data, props)
}

function flettKildedata(filename, props = {}) {
  var data = io.lesKildedatafil(filename)
  console.log(data)
  flettAttributter(data, props)
}

let counts = {}

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

flettKildedata("typer")
flettKildedata("Art/typer")
flettKildedata("Art/Fremmed_Art/typer")
flettKildedata("Fylke/typer")
flettKildedata("Natur_i_Norge/Landskap/typer")
flettKildedata("Natur_i_Norge/Natursystem/typer")
flettKildedata(
  "Natur_i_Norge/Natursystem/Beskrivelsessystem/Regional_naturvariasjon/typer"
)
flettKildedata("Natur_i_Norge/Naturvernområde/typer")
flett("vv_naturvernområde")
flett("inn_ao_fylke")
flett("inn_ao_kommune")
flett("ao_naturvernområde")
flett("or_organisasjon")
flett("ar_diagnostisk_art")
flett("na_hovedtype_relasjon")
flett("na_mi_liste")
flett("mi_variasjon")
flett("la")
flett("la_klg")
flett("ar_taxon")
flett("na_prosedyrekategori")
flett("na_definisjonsgrunnlag")
flett("statistikk")
flettKildedata("rl_rødliste")
sjekkAtTitlerEksisterer()
capsTitler()
kobleForeldre()

function capsTitler() {
  for (let key of Object.keys(r)) {
    const tittel = r[key].tittel
    Object.keys(tittel).forEach(lang => {
      let tit = tittel[lang]
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
        if (r[key].kode) log.warn("Har kode: ", key)
      }
    }
  }

  if (notitle.length > 0) {
    log.warn("Mangler tittel: " + notitle.join(", "))
    notitle.forEach(key => delete r[key])
  }
}

io.skrivDatafil(__filename, r)

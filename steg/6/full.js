const config = require("../../config")
const typesystem = require("@artsdatabanken/typesystem")
const io = require("../../lib/io")
const log = require("log-less-fancy")()

const r = {}

function flettAttributter(o, props = {}) {
  for (let key of Object.keys(o)) {
    r[key] = Object.assign({}, r[key], o[key], props)
  }
}

function capitalize(s) {}

function flett(filename, props = {}) {
  var data = io.lesDatafil(filename)
  flettAttributter(data, props)
}

function flettKildedata(filename, props = {}) {
  var data = io.lesKildedatafil(filename)
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

flettKildedata("annen_kode")
flettKildedata("vv_naturvernområde")
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
flett("ar_taxon")
flett("na_prosedyrekategori")
flett("na_definisjonsgrunnlag")
flett("statistikk")

kobleForeldre()

for (let key of Object.keys(r)) {
  const node = r[key]
  if (!node.se) {
    if (!node.tittel)
      throw new Error(`Mangler tittel for ${key}: ${JSON.stringify(node)}`)
    node.tittel = Object.entries(node.tittel).reduce((acc, e) => {
      if (!e[1])
        throw new Error(`Mangler tittel for ${key}: ${JSON.stringify(node)}`)
      acc[e[0]] = typesystem.capitalizeTittel(e[1])
      return acc
    }, {})
    if (r[key].kode) log.warn("Har kode: ", key)
  }
}

const hash = {}
Object.keys(r).forEach(key => {
  const node = r[key]
  if (!node.se) {
    if (!node.tittel) console.log(node)
    const tittel = node.tittel.nb || node.tittel.en || node.tittel.la
    if (!hash[tittel]) hash[tittel] = []
    else hash[tittel].push(key)
  }
})

io.skrivDatafil(__filename, r)

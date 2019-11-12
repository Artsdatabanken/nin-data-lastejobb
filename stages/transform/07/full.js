const typesystem = require("@artsdatabanken/typesystem")
const { io, json, log } = require("lastejobb")

const tre = {}

flettKildedata("kildedata/type")
flett("stedsnavn/type")
flett("naturvern/type")
flett("art/type")
flett("kommune/kommune")
flett("kommune/fylke")
flett("datakilde/type")
flett("inn_statistikk")
flett("maritim-grense")
flett("landskap/type")
flett("natursystem/type")

tre["NN-LA"].foreldre = ["NN"]
tre["NN-NA"].foreldre = ["NN"]

sjekkAtTitlerEksisterer()
capsTitler()

// TODO: Fjern når kildedata er ok
typesystem.kobleForeldre(tre)
propagerNedFlaggAttributt()
io.skrivDatafil(__filename, tre)

function flettAttributter(o) {
  for (let key of Object.keys(o)) {
    let kode = key.replace("_", "-")
    kode = kode.toUpperCase()
    const src = o[key]

    // TEMP HACK
    json.moveKey(src, "navn", "tittel")
    json.moveKey(src, "ingress", "beskrivelse")
    if (src.tittel) {
      if (!src.tittel.nb && src.tittel.nob)
        json.moveKey(src.tittel, "nob", "nb")
      if (!src.tittel.nb && src.tittel.eng)
        json.moveKey(src.tittel, "eng", "en")
    }
    tre[kode] = json.mergeDeep(tre[kode] || {}, src)
  }
}

function flett(filename) {
  var data = io.lesDatafil(filename)
  let o = data
  if (o.items) o = json.arrayToObject(data.items, { uniqueKey: "kode" })
  flettAttributter(o)
}

function flettKildedata(filename) {
  var data = io.readJson(filename + ".json")
  let o = data
  if (o.items) o = json.arrayToObject(data.items, { uniqueKey: "kode" })
  flettAttributter(o)
}

function propagerNedFlaggAttributt() {
  for (let kode of Object.keys(tre)) {
    const node = tre[kode]
    for (const fkode of node.foreldre) {
      const foreldernode = tre[fkode]
      if (!foreldernode)
        throw new Error(`Forelderen ${fkode} til ${kode} mangler.`)
      if (tre[fkode].type === "flagg") node.type = "flagg"
      if (tre[fkode].type === "gradient") node.type = "gradientverdi"
    }
    if (kode.startsWith("NN-NA-LKM"))
      if (!node.type) log.warn("Missing type attribute on: " + kode)
  }
}

function propagerNedFlaggAttributt() {
  for (let kode of Object.keys(tre)) {
    const node = tre[kode]
    for (const fkode of node.foreldre) {
      const foreldernode = tre[fkode]
      if (!foreldernode)
        throw new Error(`Forelderen ${fkode} til ${kode} mangler.`)
      if (tre[fkode].type === "flagg") node.type = "flagg"
      if (tre[fkode].type === "gradient") node.type = "gradientverdi"
    }
    if (kode.startsWith("NN-NA-LKM"))
      if (!node.type) log.warn("Missing type attribute on: " + kode)
  }
}

function capsTitler() {
  for (let key of Object.keys(tre)) {
    const tittel = tre[key].tittel
    Object.keys(tittel).forEach(lang => {
      let tit = tittel[lang].replace(/\s+/g, " ") // Fix double space issues in source data
      if (tit) tittel[lang] = tit.replace(tit[0], tit[0].toUpperCase())
      else log.warn("Mangler tittel: ", key)
    })
  }
}

function sjekkAtTitlerEksisterer() {
  const notitle = []
  for (let key of Object.keys(tre)) {
    const node = tre[key]
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
        if (tre[key].kode) {
          debugger
          log.warn("Har allerede unødig kode property: ", key)
        }
      }
    }
  }

  if (notitle.length > 0) {
    log.warn("Mangler tittel: " + notitle.join(", "))
    notitle.forEach(key => delete tre[key])
  }
}

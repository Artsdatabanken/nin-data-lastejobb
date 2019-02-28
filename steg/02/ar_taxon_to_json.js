var JSONStream = require("JSONStream")
var csv = require("csv")
const fs = require("fs")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")

const kildefil = config.getDataPath("inn_ar_taxon", ".csv")
const rs = fs.createReadStream(kildefil, "latin1")
const writePath = config.getDataPath(__filename)
const ws = fs.createWriteStream(writePath)

const csvOptions = {
  delimiter: ";",
  relax_column_count: true,
  escape: "\\"
}

let header

importCsv(kildefil)

async function importCsv(kildefil) {
  await rs
    .pipe(csv.parse(csvOptions))
    .pipe(csv.transform(transform))
    .pipe(JSONStream.stringify())
    .pipe(ws)
}

function transform(record) {
  //  log.warn(rows)
  if (!header) {
    header = record
    return
  }
  let r = {}
  for (var i = 0; i < record.length; i++) {
    const value = record[i]
    if (value && !value.startsWith("Not_assigned")) r[header[i]] = value
  }

  // TODO: Fjern varietet og form inntil videre
  //  if (r["Underart"]) return
  if (r["Varietet"]) return
  if (r["Form"]) return

  const o = {
    id: r.PK_LatinskNavnID,
    parentId: r.FK_OverordnaLatinskNavnID,
    tittel: { la: settSammenNavn(r) },
    status: r.Hovedstatus,
    gyldigId: r.FK_GyldigLatinskNavnID,
    finnesINorge: r.FinnesINorge === "Ja"
  }
  //  if (o.tittel.la === "Incertae sedis") return
  //  if (o.tittel.la === "Incerta sedis") return
  //  if (o.tittel.la === "(Rekke) Incertae sedis") return

  pop(o.tittel, "nb", r, "Bokmål")
  pop(o.tittel, "nn", r, "Nynorsk")
  pop(o.tittel, "sa", r, "Samisk")
  return o
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function pop(o, key, r, suffix) {
  const value = r["Populærnavn" + suffix]
  if (!value) return
  o[key] = capitalizeFirstLetter(value)
}

const hierarki = [
  "Rike",
  "Underrike",
  "Rekke",
  "Underrekke",
  "Overklasse",
  "Klasse",
  "Underklasse",
  "Infraklasse",
  "Kohort",
  "Overorden",
  "Orden",
  "Underorden",
  "Infraorden",
  "Overfamilie",
  "Familie",
  "Underfamilie",
  "Tribus",
  "Undertribus",
  "Slekt",
  "Underslekt",
  "Seksjon",
  "Art",
  "Underart",
  "Varietet",
  "Form"
].reverse()

function settSammenNavn(r) {
  for (i = 0; i < hierarki.length; i++) {
    const nivå = hierarki[i]
    if (r[nivå]) return r[nivå]
  }
  throw new Error("Mangler navn på art med sciId #" + r.PK_LatinskNavnID)
}

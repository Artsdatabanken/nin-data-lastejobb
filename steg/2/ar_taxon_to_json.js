var JSONStream = require("JSONStream")
var csv = require("csv")
const fs = require("fs")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")

const kodesystem = config.kodesystem

const kildefil = config.getDataPath("inn_ar_taxon", ".csv")
const rs = fs.createReadStream(kildefil, "latin1")
const writePath = config.getDataPath(__filename)
const ws = fs.createWriteStream(writePath)

const csvOptions = {
  delimiter: ";",
  relax_column_count: true,
  escape: "\\"
  //  to: 5
}

importCsv(kildefil)

async function importCsv(kildefil) {
  await rs
    .pipe(csv.parse(csvOptions))
    .pipe(csv.transform(transform))
    .pipe(JSONStream.stringify())
    .pipe(ws)
}

let header
function transform(record) {
  if (!header) {
    header = record
    return
  }
  let r = {}
  for (var i = 0; i < record.length; i++) {
    const value = record[i]
    if (value && !value.startsWith("Not_assigned")) r[header[i]] = value
  }
  if (r["Hovedstatus"] !== "Gyldig") return

  const o = {
    id: r.PK_LatinskNavnID,
    parent: r.FK_OverordnaLatinskNavnID,
    tittel: { la: settSammenNavn(r) }
  }

  if (o.tittel.la === "Incertae sedis") return
  if (o.tittel.la === "Incerta sedis") return
  if (o.tittel.la === "(Rekke) Incertae sedis") return

  pop(o.tittel, "nb", "Bokmål")
  pop(o.tittel, "nn", "Nynorsk")
  pop(o.tittel, "sa", "Samisk")
  return o
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function pop(o, key, suffix) {
  const value = o["Populærnavn" + suffix]
  if (!value) return
  o[key] = capitalizeFirstLetter(value)
}

function settSammenNavn(r) {
  if (r["Underart"]) return `${r["Art"]} ${r["Underart"]}`
  if (r["Varietet"]) return `${r["Art"]} ${r["Varietet"]}`
  if (r["Form"]) return `${r["Art"]} ${r["Form"]}`
  if (r["Art"]) return `${r["Slekt"]} ${r["Art"]}`
  if (r["Familie"]) return r["Familie"]
  if (r["Orden"]) return r["Orden"]
  if (r["Underklasse"]) return r["Underklasse"]
  if (r["Klasse"]) return r["Klasse"]
  if (r["Underrekke"]) return r["Underrekke"]
  if (r["Rekke"]) return r["Rekke"]
  if (r["Rike"]) return r["Rike"]
  throw new Error("Mangler navn på art med sciId #" + r.PK_LatinskNavnID)
}

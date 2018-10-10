var JSONStream = require("JSONStream")
var csv = require("csv")
const fs = require("fs")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")

const kildefil = config.kildedataPath + "/la.csv"
const rs = fs.createReadStream(kildefil, "utf-8")
const writePath = config.getDataPath(__filename)
const ws = fs.createWriteStream(writePath)

const csvOptions = {
  delimiter: ",",
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

function lagKode(nøkkel) {
  nøkkel = `LA_${nøkkel[3]}-${nøkkel.substring(4)}`
  return nøkkel
}

function transform(record) {
  if (!header) {
    header = {}
    for (let i = 0; i < record.length; i++) header[record[i]] = i
    return
  }

  return {
    kode: lagKode(record[header["S_kode"]]),
    tittel: record[header["Name"]].trim()
  }
}

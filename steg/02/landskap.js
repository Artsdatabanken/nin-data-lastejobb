var JSONStream = require("JSONStream")
const fs = require("fs")
const { csv, io, log } = require("lastejobb")
const config = require("../../config")
var csv2 = require("csv")

class CsvToJson {
  constructor(csvOptions) {
    this.csvOptions = csvOptions || {
      delimiter: ",",
      relax_column_count: true,
      escape: "\\"
    }
  }

  async convert(kildefil, writePath) {
    this.header = null
    const rs = fs.createReadStream(kildefil, "utf-8")
    const ws = fs.createWriteStream(writePath)
    await rs
      .pipe(csv2.parse(this.csvOptions))
      .pipe(csv2.transform(this.transform))
      .pipe(JSONStream.stringify())
      .pipe(ws)
  }

  transform(record) {
    if (!this.header) {
      this.header = {}
      for (let i = 0; i < record.length; i++)
        this.header[i] = record[i].toLowerCase() || "field" + i
      return
    }

    if (record.length <= 1) return null
    let r = {}
    for (let i = 0; i < record.length; i++) r[this.header[i]] = record[i].trim()
    return r
  }
}

importer("Natur_i_Norge/Landskap/Typeinndeling/type.csv", "landskap")
importer(
  "Natur_i_Norge/Landskap/Landskapsgradient/gradient.csv",
  "landskapsgradient"
)
importer(
  "Natur_i_Norge/Landskap/Landskapsgradient/relasjon_til_natursystem.csv",
  "relasjon_til_natursystem"
)
importer(
  "Natur_i_Norge/Landskap/bilder_som_gjenbrukes.csv",
  "landskap_bilder_som_gjenbrukes"
)
importer2("Natur_i_Norge/Landskap/Typeinndeling/type.csv", "landskap2")

function importer(csvFil, utFil) {
  const kildefil = config.kildedataPath + "/" + csvFil
  const json = csv.les(kildefil, { from_line: 2 })
  const writePath = "data/" + utFil + ".csv.json"
  io.writeJson(writePath, json)
}

function importer2(csvFil, utFil) {
  const kildefil = config.kildedataPath + "/" + csvFil
  const writePath = "data/" + utFil + ".csv.json"
  log.info("Import " + csvFil + " to " + writePath)
  new CsvToJson().convert(kildefil, writePath)
}

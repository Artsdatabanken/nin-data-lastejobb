var JSONStream = require("JSONStream")
var csv = require("csv")
const fs = require("fs")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")

class CsvToJson {
  constructor(csvOptions) {
    this.csvOptions = csvOptions || {
      delimiter: "\t",
      relax_column_count: true,
      escape: "\\"
    }
  }

  async convert(kildefil, writePath) {
    this.header = null
    const rs = fs.createReadStream(kildefil, "utf-8")
    const ws = fs.createWriteStream(writePath)
    await rs
      .pipe(csv.parse(this.csvOptions))
      .pipe(csv.transform(this.transform))
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

    let r = {}
    for (let i = 0; i < record.length; i++) r[this.header[i]] = record[i].trim()
    return r
  }
}

importer("Natur_i_Norge/Landskap/la.csv")
importer("Natur_i_Norge/Landskap/la_klg.csv")

function importer(csvFil) {
  const kildefil = config.kildedataPath + "/" + csvFil
  const writePath = config.getDataPath(csvFil + ".json")
  log.info("Import " + csvFil + " to " + writePath)
  new CsvToJson().convert(kildefil, writePath)
}

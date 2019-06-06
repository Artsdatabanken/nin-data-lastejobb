const parse = require("csv-parse/lib/sync")
const fs = require("fs")

function les(csvFilePath) {
  const input = fs.readFileSync(csvFilePath)
  const records = parse(input, {
    columns: true
  })
  return records
}

module.exports = { les }

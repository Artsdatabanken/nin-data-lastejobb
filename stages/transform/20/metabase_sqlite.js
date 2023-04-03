return false // Not currently in use - transitioned to flat files

const { io, log } = require("@artsdatabanken/lastejobb")
const sqlite3 = require("sqlite3")
const fs = require("fs")
var zlib = require("zlib")

const sqliteFilePath = config.getBuildPath("metabase", ".sqlite")
if (fs.existsSync(sqliteFilePath)) fs.unlinkSync(sqliteFilePath)

let data = io.lesBuildfil("metabase")

const db = new sqlite3.Database(sqliteFilePath)

db.serialize(function () {
  db.run("CREATE TABLE meta(kode TEXT PRIMARY KEY, verdi BLOB);")
  // var stmt = db.prepare("INSERT INTO meta (kode, verdi) VALUES (?,?)")
  db.run("BEGIN")
  Object.keys(data).forEach(kode => {
    // stmt.run(kode, 'compress(JSON.stringify(data[kode]))')
    const payload = data[kode]["@"] || data[kode]
    db.run(
      "INSERT INTO meta (kode, verdi) VALUES (?,?)",
      kode,
      compress(payload)
    )
  })
  //  stmt.finalize()
  db.run("END")
  db.close()
  log.info("Successful write sqlite db")
})

function compress(json) {
  return zlib.gzipSync(JSON.stringify(json))
}

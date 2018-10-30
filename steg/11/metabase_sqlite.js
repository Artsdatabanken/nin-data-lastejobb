const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const sqlite3 = require("sqlite3")
const fs = require("fs")
var zlib = require("zlib")

const sqliteFilePath = config.getBuildPath("metabase", ".sqlite")
if (fs.existsSync(sqliteFilePath)) fs.unlinkSync(sqliteFilePath)

let data = io.lesDatafil("metabase")

const db = new sqlite3.Database(
  sqliteFilePath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE
)

db.serialize(function() {
  db.run("CREATE TABLE meta(kode TEXT PRIMARY KEY, verdi BLOB);")
  // var stmt = db.prepare("INSERT INTO meta (kode, verdi) VALUES (?,?)")
  db.run("BEGIN")
  Object.keys(data).forEach(kode => {
    // stmt.run(kode, 'compress(JSON.stringify(data[kode]))')
    db.run(
      "INSERT INTO meta (kode, verdi) VALUES (?,?)",
      kode,
      compress(data[kode])
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

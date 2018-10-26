const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const sqlite3 = require("sqlite3") //.verbose();
const fs = require("fs")
var zlib = require("zlib")

let data = io.lesDatafil("metabase")

const sqliteFilePath = config.getBuildPath("metabase", ".sqlite")
if (fs.existsSync(sqliteFilePath)) fs.unlinkSync(sqliteFilePath)

const db = new sqlite3.Database(
  sqliteFilePath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE
)

db.serialize(function() {
  db.run("CREATE TABLE meta(kode TEXT PRIMARY KEY, verdi BLOB);")
  var stmt = db.prepare("INSERT INTO meta (kode, verdi) VALUES (?,?)")
  db.run("BEGIN")
  Object.keys(data).forEach(kode => {
    const zip = compress(data[kode], (err, zip) => {
      if (err) throw new Error(err)
      console.log(zip.length)
      stmt.run(kode, zip)
    })
  })
  db.run("END")
  stmt.finalize()
})
db.close()

async function compress(o, cb) {
  const json = JSON.stringify(o)
  const zip = zlib.gzipSync(json, cb)
  return zip
}

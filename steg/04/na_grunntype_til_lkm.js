if (!process.env.DEBUG) process.env.DEBUG = "*"
const path = require("path")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")
const typesystem = require("@artsdatabanken/typesystem")

let rows = io.lesDatafil("na_grunntype_til_lkm.csv.json")
let nin_liste = io.lesDatafil("na_kode")
let mi_liste = io.lesDatafil("na_mi_liste")
const replace = {
  "S3-E": "S3E",
  "S3-F": "S3F",
  "S3-S": "S3S"
}

const ukjent_nin = {}
const ukjent_mi = {}
let r = {}

function makeRange(seq) {
  seq = seq.replace("ABC-2", "ABCDE+x0123")
  const i = seq.indexOf("-")
  if (i < 0) return seq
  const start = seq[i - 1].charCodeAt(0)
  const end = seq[i + 1].charCodeAt(0)
  let r2 = ""
  for (let j = start; j <= end; j++) r2 += String.fromCharCode(j)
  seq = seq.split("")
  seq.splice(i - 1, 3, r2)
  return seq.join("")
}

function hack(kode) {
  Object.entries(replace).forEach(([key, value]) => {
    kode = kode.replace(key, value)
  })
  return kode
}

function decode(mii) {
  mi = mii.toUpperCase()
  mi = hack(mi)
  const splitPos = mi.indexOf("-")
  var kode = mi.substring(0, splitPos)
  var verdi = mi.substring(splitPos + 1)
  verdi = makeRange(verdi)
  const r = []
  const nykode = "NN-NA-LKM-" + kode + "-"
  if (!kode) debugger
  for (const c of verdi) r.push(nykode + c)
  return r
}

rows.forEach(row => {
  let na = "NN-NA-TI-" + row["grunntype_kode"].replace("NA-", "")
  if (!(na in nin_liste)) return (ukjent_nin[na] = (ukjent_nin[na] || 0) + 1)
  for (var i = 1; i <= 6; i++) {
    const e = row["lkm_basistrinn" + i]
    if (!e) return
    if (e.startsWith("HS*")) return // Se bort fra hovedtypetilpasset
    const list = decode(e)
    list.forEach(mi => {
      if (mi.indexOf("S3-") >= 0) debugger
      if (!(mi in mi_liste)) {
        debugger
        log.warn(mi, mi)
        return (ukjent_mi[mi] = (ukjent_mi[mi] || 0) + 1)
      }
      if (!r[na]) r[na] = []
      r[na].push(mi)
    })
  }
})

if (ukjent_nin) log.warn("Ukjente naturtyper", ukjent_nin)
if (ukjent_mi) log.warn("Ukjente lkm", ukjent_mi)

io.skrivDatafil(__filename, r)

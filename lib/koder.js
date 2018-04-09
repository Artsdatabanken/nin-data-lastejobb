// @flow
if (!process.env.DEBUG) process.env.DEBUG = "*"
const config = require("../config")
const log = require("log-less-fancy")("koder")

// Navnet på attributtet som inneholder data for noden selv
const DATAKEY = "@"

function medGyldigeTegn(s) {
  const r = s
    .split("")
    .map(c => {
      const lc = c.toLowerCase()
      if ("_,./()[] ".indexOf(c) >= 0) return "_"
      if ("abcdefghijklmnopqrstuvxyzæøå0123456789".indexOf(lc) >= 0) return c
      return ""
    })
    .join("")
  if (!r.toLowerCase().match(/^[a-zæøå0-9_]+$/i)) {
    log.error(s, "_" + r + "_")
    //    return ''
  }
  return r
}
function medGyldigeTegnGammel(s) {
  s = s.replace(/'/g, "")
  const ban = "'.:;\"?*#$/%<>‘&∞≤’="
  //  const from = '×êëàö []'
  //  const to = 'xeeao_'
  const from = " ­­,[]()/×"
  const to = "_______x"
  s = s
    .split("")
    .map(c => {
      if (ban.indexOf(c) >= 0) return null
      const i = from.indexOf(c)
      if (i >= 0) return to[i]
      else return c
    })
    .join("")
  if (!s.toLowerCase().match(/^[\(\)×âéêëàíôöüæøåa-z0-9_-]+$/i)) {
    log.error("_" + s + "_")
    //    return ''
  }
  return s
}

function artskode(scientificNameId) {
  if (scientificNameId === 0)
    return config.kodesystem.prefix.taxon.replace("_", "")
  return config.kodesystem.prefix.taxon + scientificNameId
  //  return config.prefix.taxon + medGyldigeTegn(scientificName)
}

function hovedtype(subkode) {
  return subkode.split("-")[0]
}

function erGrunntype(kode) {
  if (kode.match(/NA_[A-Z][0-9]+-[0-9]+/gi)) return true
}

function erKartleggingsnivå(kode) {
  if (kode.match(/-E-/gi)) return true
  if (kode.match(/-C-/gi)) return true
}

function capitalizeTittel(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function kodkode(scientificNameId, codePrefix = "TX_") {
  return codePrefix + scientificNameId.toString(36).toUpperCase()
}

function splittKode(kode) {
  let segments = kode.match(/[a-zA-Z]+|[0-9]+/g)
  return segments || []
}

function lookupBarn(db, kode) {
  let node = lookup(db, kode)
  const keys = Object.keys(node)
  return keys.filter(kode => kode !== DATAKEY)
}

function hentFlatt(db, prefix = "") {
  let flat = {}
  lookupBarn(db).forEach(k => {
    flat[prefix ? prefix + "/" + k : k] = db[k]
    Object.assign(flat, kiddos.forEach(lookupBarn(db[k])))
  })
}

function lookup(db, kode) {
  if (!kode) return db
  const path = splittKode(kode)
  let forelder = null
  for (var i = 0; i < path.length; i++) {
    const seg = path[i]
    if (!db[seg]) {
      console.log("!DB")
      return null
    }
    forelder = db
    db = db[seg]
  }
  return db
}

function lookupWithCreate(db, kode) {
  if (!kode) return db
  const path = splittKode(kode)
  let forelder = null
  path.forEach(seg => {
    if (!db[seg]) {
      db[seg] = {
        "@": {
          kode: kode,
          barn: {},
          forelder: { kode: db["@"].kode, tittel: db["@"].tittel }
        }
      }
    }
    forelder = db
    db = db[seg]
  })
  return db
}

module.exports = {
  DATAKEY,
  kodkode,
  splittKode,
  medGyldigeTegn,
  lookup,
  lookupWithCreate,
  lookupBarn,
  hentFlatt,
  capitalizeTittel,
  erGrunntype,
  erKartleggingsnivå,
  hovedtype,
  artskode
}

const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")
const typesystem = require("@artsdatabanken/typesystem")

let kommuner = io.lesDatafil("inn_ao_kommune")
let fylker = io.lesDatafil("inn_ao_fylke")

const r = {}

function lagRelasjonTilVerneområdeRot() {
  return {
    kode: typesystem.verneområde.prefiks,
    kant: "verneområde",
    kantRetur: "fylke"
  }
}

function lagKoder(kilde, nivå) {
  Object.keys(kilde).forEach(key => {
    const o = kilde[key]
    const e = {
      foreldre: [key],
      tittel: { nb: "Naturvernområder i " + o.tittel.nb + " " + nivå }
    }
    if (nivå === "fylke") e.relasjon = [lagRelasjonTilVerneområdeRot()]

    r[key + "-VV"] = e
  })
  return r
}

lagKoder(kommuner, "kommune")
lagKoder(fylker, "fylke")

io.skrivDatafil(__filename, r)

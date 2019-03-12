const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")
const typesystem = require("@artsdatabanken/typesystem")

let kommuner = io.lesDatafil("inn_ao_kommune")
let fylker = io.lesDatafil("inn_ao_fylke")

const r = {}

function lagRelasjonTilVerneområdeRot() {
  return {
    kode: typesystem.verneområde.prefiks + "-AO",
    kant: "verneområde",
    kantRetur: "fylke",
    erSubset: true
  }
}

function lagKoder(kilde, nivå) {
  Object.keys(kilde).forEach(key => {
    const o = kilde[key]
    const e = {
      type: "flagg",
      tittel: { nb: "Naturvernområde i " + o.tittel.nb + " " + nivå }
    }
    if (nivå === "fylke") e.foreldre = ["VV-AO"]
    r["VV-" + key.replace("_", "-")] = e
  })
  return r
}

function lagFylkesmann(kilde) {
  Object.keys(kilde).forEach(key => {
    const o = kilde[key]
    const e = {
      tittel: { nb: "Fylkesmannen i " + o.tittel.nb },
      foreldre: ["VV-FM-FM"],
      relasjon: [
        {
          kode: key,
          kant: "forvalter",
          kantRetur: "verneområder som forvaltes av",
          erSubset: true
        }
      ]
    }
    r[key.replace("AO-", "VV-FM-FM-")] = e
  })
  return r
}

lagKoder(kommuner, "kommune")
lagKoder(fylker, "fylke")
lagFylkesmann(fylker)

io.skrivDatafil(__filename, r)

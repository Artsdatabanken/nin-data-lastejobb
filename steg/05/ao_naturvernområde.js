const io = require("../../lib/io")

let kommuner = io.readJson("./kommune-data/kommune.json").items
let fylker = io.readJson("./kommune-data/fylke.json").items

const r = {}

function lagKoder(kilde, nivå) {
  kilde.forEach(o => {
    const key = "AO-" + o.code.replace("NO-", "")
    const e = {
      type: "flagg",
      tittel: { nb: "Naturvernområde i " + o.itemLabel + " " + nivå }
    }
    if (nivå === "fylke") e.foreldre = ["VV-AO"]
    r["VV-" + key.replace("_", "-")] = e
  })
  return r
}

function lagFylkesmann(kilde) {
  kilde.forEach(o => {
    const key = "AO-" + o.code.replace("NO-", "")
    const e = {
      tittel: { nb: "Fylkesmannen i " + o.itemLabel },
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

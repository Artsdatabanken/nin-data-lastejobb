const config = require("../../config")
const io = require("../../lib/io")
const typesystem = require("@artsdatabanken/typesystem")

let hovedtyper = io.lesDatafil("la_to_json")
let gradienter = io.lesKildedatafil("la_lg")

const r = {}

hovedtyper.forEach(e => {
  r[e.kode] = {
    tittel: { nb: e.tittel }
  }
})

Object.keys(gradienter).forEach(kode => {
  const gradKoder = gradienter[kode]
  const relasjoner = []
  gradKoder.forEach(gradKode => {
    relasjoner.push({
      kode: gradKode,
      kant: "definert av",
      kantRetur: "definerer"
    })
  })
  r[kode].relasjon = relasjoner
  console.log(r[kode])
})

io.skrivDatafil(__filename, r)

const io = require("../../lib/io")
const csv = require("../../lib/csv")

const organisasjonTilKode = {}
let organisasjon = io.lesKildedatafilOld("Datakilde/organisasjon")
Object.entries(organisasjon).forEach(([kode, o]) => {
  organisasjonTilKode[o.tittel.nb] = kode
  organisasjonTilKode[kode] = kode
  organisasjonTilKode[kode.replace("OR-", "")] = kode
})

let datasett = csv.les("nin-data/Natur_i_Norge/datasett.csv")
// Sorter slik at mer spesifikke koder kommer sist og overstyrer generell datakilde
datasett.sort((a, b) => a.Datasett.length - b.Datasett.length)
lagRelasjonTilDatasett(datasett)
io.skrivDatafil(__filename, organisasjon)

function lagRelasjonTilDatasett(datasett) {
  datasett.forEach(ds => {
    const { Datasett: kode, Dataleverandør, ...datasett } = ds
    const orgkode = organisasjonTilKode[Dataleverandør]
    if (!orgkode) throw new Error("Ukjent dataleverandør: ", Dataleverandør)
    const o = organisasjon[orgkode]
    if (!o.relasjon) o.relasjon = []
    const rel = {
      kode: kode,
      kant: "Datasett",
      kantRetur: "Datakilde",
      kantReturFraAlleBarna: true,
      erSubset: true
    }
    Object.entries(datasett).forEach(([key, value]) => {
      rel[key.toLowerCase()] = value
    })
    o.relasjon.push(rel)
  })
}

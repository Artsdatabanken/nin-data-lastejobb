const { io } = require("lastejobb")

let data = io.lesBuildfil("metabase")
const taxons = readTaxons()
let r = []

Object.keys(data).forEach(kode => {
  const node = data[kode]
  const taxonId = taxons[kode]
  if (!taxonId) return
  r.push({ kode: kode, taxonId: taxonId, url: node.url })
})
io.skrivDatafil(__filename, r)

/*
Object.keys(data).forEach(kode => {
  const taxonId = taxons[kode]
  if (!taxonId) return
  const url = `https://artskart.artsdatabanken.no/appapi/api/data/SearchLocations\?\&TaxonIds%5B%5\=${taxonId}\&IncludeSubTaxonIds\=true\&EpsgCode\=32633\&YearFrom\=2000\&YearTo\=0\&CoordinatePrecisionFrom\=0\&CoordinatePrecisionTo\=1000`
  const cmdline = `wget -O ${taxonId}.json ${url}`
  debugger
  let cmd = execSync(cmdline)
  console.log(`stderr: ${cmd.stderr.toString()}`)
  console.log(`stdout: ${cmd.stdout.toString()}`)
  throw new Error(".")
})
*/
function readTaxons() {
  let taxon = io.lesDatafil("ar_taxon_to_json")
  const taxons = {}
  taxon.forEach(t => {
    taxons["AR-" + t.id] = t.taxonId
  })
  return taxons
}

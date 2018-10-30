const config = require("../../config")
const io = require("../../lib/io")

let data = io.lesDatafil("metabase_med_bbox")
const farger = io.lesDatafil("farger")

let tempCounter = 0
let tempColors = [
  "#d53e4f",
  "#f46d43",
  "#fdae61",
  "#fee08b",
  "#e6f598",
  "#abdda4",
  "#66c2a5",
  "#3288bd"
]

function slåOppFarge(kode) {
  // Supersløvt prefiks oppslag
  if (farger[kode]) return farger[kode]
  for (let fkode of Object.keys(farger)) {
    if (kode.startsWith(fkode)) return farger[fkode]
  }
  return null
}

function tilordneFarger(barna, rotFarge) {
  Object.keys(barna).forEach(bkode => {
    const barn = barna[bkode]
    let minFarge = data[bkode].farge
    // Bruk farger definert i farger.json
    minFarge = minFarge || slåOppFarge(bkode)
    if (minFarge) barn.farge = minFarge
  })
}

tilordneFarger(data, "")

io.skrivDatafil(__filename, data)

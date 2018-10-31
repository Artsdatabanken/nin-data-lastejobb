const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

let index = io.lesKildedatafil("raster_index", {})
let hierarki = io.lesDatafil("kodehierarki")
let inn = io.lesDatafil("full_med_graf")
let ut = []

function assignIndex(kode) {
  const foreldre = hierarki.foreldre[kode]
  if (!foreldre) return
  const forelder = foreldre[0]
  if (!index[forelder]) index[forelder] = { watermark: 0 }
  const rn = index[forelder]
  if (rn[kode]) return rn[kode]
  rn[kode] = rn.watermark
  rn.watermark += 1
  return rn[kode]
}

Object.keys(inn).forEach(kode => {
  const node = inn[kode]
  node.rasterColor = assignIndex(kode)
})

io.skrivDatafil(__filename, inn)
io.skrivKildedatafil("raster_index", index)

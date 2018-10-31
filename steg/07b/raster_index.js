const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

let index = io.lesKildedatafil("raster_index")
let inn = io.lesDatafil("full_med_graf")
let ut = []

Object.keys(inn).forEach(forelder => {
  const node = inn[forelder]
  console.log(node)
})

io.skrivKildedatafil(__filename, ut)

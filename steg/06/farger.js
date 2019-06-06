//if (!process.env.DEBUG) process.env.DEBUG = "*"
const { io } = require("lastejobb")
const tinycolor = require("tinycolor2")

let r = {}

function settFarger(kilde, mapper) {
  if (!mapper) throw new Error("asdf")
  Object.keys(kilde).forEach(kode => {
    let farge = mapper(kilde[kode])
    r[kode] = farge.toHexString()
  })
}

const bareFargen = node => tinycolor(node.farge)
const lighten = node => tinycolor(node).lighten(20)

settFarger(io.readJson("kildedata/farger.json"), bareFargen)
settFarger(io.lesDatafil("la_farger"), bareFargen)
settFarger(
  io.readJson("kildedata/Natur_i_Norge/Natursystem/farger_dominant.json"),
  lighten
)

io.skrivBuildfil(__filename, r)

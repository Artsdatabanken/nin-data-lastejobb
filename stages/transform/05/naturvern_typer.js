const { io } = require("lastejobb")

const r = []
include("type.json")

function include(fn) {
  if (!fn) return
  let rot = io.readJson("./data/naturvern/" + fn)
  rot.items.forEach(e => {
    r.push(e)
    include(e.definisjon)
  })
}

io.skrivDatafil(__filename, r)

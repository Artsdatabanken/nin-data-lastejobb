const { io } = require("lastejobb")

let full = io.lesDatafil("metabase_bbox")
let r = []

Object.keys(full).forEach(kode => {
  const node = full[kode]
  if (!node.mediakilde) return
  r.push({ kode: kode, mediakilde: node.mediakilde })
  delete node.mediakilde
})

io.skrivDatafil("metabase_bilder", full)
io.skrivBuildfil("mediakilde", r)

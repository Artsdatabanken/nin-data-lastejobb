main();
function main() {
const { io } = require("@artsdatabanken/lastejobb")

  let full = io.lesTempJson("metabase_bbox")
  let r = []

  Object.keys(full).forEach(kode => {
    const node = full[kode]
    if (!node.mediakilde) return
    r.push({ kode, ...node.mediakilde })
    delete node.mediakilde
  })

  io.skrivDatafil("metabase_bilder", full)
  r.sort((a, b) => (a.kode > b.kode ? 1 : -1))
  io.skrivBuildfil("mediakilde", r)
}
const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

let inn = io.lesDatafil("full_med_graf")
let ut = []

Object.keys(inn).forEach(forelder => {
  const node = inn[forelder]
  node.barn = []
})

function dyttInn(kode) {
  const node = inn[kode]
  node.kode = kode
  node.tittel = node.tittel
    ? node.tittel.nb || node.tittel.en || node.tittel.la
    : "?"
  let foreldre = node.foreldre
  if (!foreldre) {
    console.warn("Mangler forelder: " + kode)
    return
  }

  foreldre.forEach(forelder => {
    let fn = inn[forelder]
    if (!fn) {
      console.warn("Finner ikke kode ", forelder)
      return
    }
    fn.kode = forelder
    fn.barn.push(node)
  })
}

function lagdelAv(barn, forfedre) {
  const node = inn[barn.kode]
  const delAv = []
  if (!node.graf) return forfedre
  Object.keys(node.graf).forEach(kant => {
    const nodes = node.graf[kant]
    Object.keys(nodes).forEach(kode => {
      const node = nodes[kode]
      if (node.erSubset) delAv.push(kode)
    })
  })
  delAv.push(...forfedre)
  return delAv
}

function eksporter(node, forfedre = [], nivå = 0) {
  if (!node.barn) return

  forfedre = Object.assign([], forfedre)
  if (node.kode !== typesystem.rotkode) forfedre.push(node.kode)
  node.barn.forEach(barn => {
    const rel = {
      kode: barn.kode,
      nivå: nivå,
      delAv: lagdelAv(barn, forfedre),
      tittel: barn.tittel
    }
    ut.push(rel)
    eksporter(barn, forfedre, nivå + 1)
  })
}

Object.keys(inn).forEach(kode => {
  dyttInn(kode)
})

eksporter({ kode: typesystem.rotkode, barn: [inn[typesystem.rotkode]] })

io.skrivBuildfil(__filename, ut)

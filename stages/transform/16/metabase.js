const { io } = require("lastejobb")

let tre = io.lesDatafil("metabase_bilder.gammel.json")
let hierarki = io.lesDatafil("kodehierarki")
const barnAv = hierarki.barn
Object.keys(tre).forEach(kode => mapBarn(kode))
Object.keys(tre).forEach(kode => flyttDatakildeTilToppnivå(kode))
Object.keys(tre).forEach(kode => fjernGrafnode(kode))

io.skrivBuildfil("metabase", tre)

function fjernGrafnode(kode) {
  const node = tre[kode]
  delete node.graf
}

function flyttDatakildeTilToppnivå(kode) {
  const node = tre[kode]
  if (!node.graf) return
  for (let i = 0; i < node.graf.length; i++) {
    const gn = node.graf[i]
    if (gn.type !== "Datakilde") continue
    node.datakilde = gn.noder
    node.graf.splice(i, 1)
    break
  }
}

function mapBarn(key) {
  let node = tre[key]
  let barn = []
  if (barnAv[key]) {
    barnAv[key].forEach(ckey => {
      if (erRelasjon(key, ckey)) return
      const cnode = tre[ckey]
      if (!cnode) return
      const barnet = {
        tittel: cnode.tittel,
        kode: ckey,
        url: cnode.url,
        sortering: cnode.sortering,
        intervall: cnode.intervall,
        normalisertVerdi: cnode.normalisertVerdi,
        skjul: cnode.skjul,
        farge: cnode.farge
      }
      if (cnode.kart && cnode.kart.format && cnode.kart.format.raster_indexed)
        barnet.index = cnode.kart.format.raster_indexed.index
      barn.push(barnet)
    })
  }
  node.barn = barn
}

// Om den underliggende koden er definert som en relasjon
function erRelasjon(key, ckey) {
  const nodeFra = tre[key]
  if (nodeFra.flagg && nodeFra.flagg[ckey]) return true
  const graf = nodeFra.graf
  if (!graf) return false
  for (var relasjon of graf) {
    for (var node of relasjon.noder) {
      if (node.kode === ckey) {
        return true
      }
    }
  }
  return false
}

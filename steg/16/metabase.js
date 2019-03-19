const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

let tre = io.lesDatafil("metabase_bilder")
let hierarki = io.lesDatafil("kodehierarki")
const barnAv = hierarki.barn
Object.keys(tre).forEach(kode => mapBarn(kode))
Object.keys(tre).forEach(kode => flyttDatakildeTilToppnivå(kode))

io.skrivBuildfil("metabase", tre)

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
      if (erRelasjon(key, ckey)) {
        return
      }
      const cnode = tre[ckey]
      if (!cnode) return
      barn.push({
        tittel: cnode.tittel,
        kode: cnode.kode,
        url: cnode.url,
        sortering: cnode.sortering,
        intervall: cnode.intervall,
        normalisertVerdi: cnode.normalisertVerdi,
        skjul: cnode.skjul,
        farge: cnode.farge
      })
    })
  }
  node.barn = barn
}

// Om den underliggende koden er definert som en relasjon
function erRelasjon(key, ckey) {
  const graf = tre[key].graf
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

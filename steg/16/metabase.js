const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

let tre = io.lesDatafil("metabase_bilder")
let hierarki = io.lesDatafil("kodehierarki")
const barnAv = hierarki.barn
Object.keys(tre).forEach(kode => mapBarn(kode))
io.skrivBuildfil("metabase", tre)

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

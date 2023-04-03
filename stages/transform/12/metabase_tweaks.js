main();
function main() {
  const { io, log } = require("@artsdatabanken/lastejobb")

  let tre = io.lesTempJson("metabase_med_url")
  let hierarki = io.lesTempJson("kodehierarki")
  const foreldreTil = hierarki.foreldre

  let ukjenteKoder = []
  let manglerKode = []

  Object.keys(tre).forEach(kode => mapOverordnet(kode))

  settFargePåRelasjoner()

  if (ukjenteKoder.length > 0)
    log.warn("Kobling til +" + ukjenteKoder.length + " ukjente koder")
  if (Object.keys(manglerKode).length > 0)
    log.warn("Mangler kode " + Object.keys(manglerKode))

  io.skrivDatafil(__filename, tre)

  function settFargePåRelasjoner() {
    Object.keys(tre).forEach(kode => {
      const node = tre[kode]
      if (!node.graf) return
      Object.keys(node.graf).forEach(typeRelasjon => {
        const noder = node.graf[typeRelasjon].noder
        noder.forEach(node => {
          if (!tre[node.kode]) {
            ukjenteKoder.push(node.kode)
            return
          }
          node.farge = tre[kode].farge
          delete node.erSubset
        })
      })
    })
  }

  function nøstOppForfedre(forelderkey) {
    let r = []
    while (forelderkey) {
      //    detectHeapOverflow()
      let forelder = tre[forelderkey]
      if (!forelder) {
        manglerKode[forelderkey] = true
        return
      }
      const overordnet = {
        kode: forelderkey,
        tittel: forelder.tittel,
        url: forelder.url,
        nivå: forelder.nivå
      }
      if (forelder.stats) overordnet.areal = forelder.stats.areal
      r.push(overordnet)
      const forfedre = foreldreTil[forelderkey]
      if (!forfedre) break
      if (forfedre.length <= 0) break
      forelderkey = forfedre[0]
      if (r.find(e => e.kode === forelderkey)) throw new Error(forelderkey + ": " + JSON.stringify(r))
    }
    return r
  }

  function mapOverordnet(key) {
    let node = tre[key]
    if (!node) throw new Error("Finner ikke " + key)
    if (!node.overordnet) {
      if (!node.foreldre) {
        log.warn("mangler forelder: " + key)
      }
      node.overordnet =
        node.foreldre && node.foreldre.length > 0
          ? nøstOppForfedre(node.foreldre[0])
          : []
      delete node.foreldre
    }
  }
}
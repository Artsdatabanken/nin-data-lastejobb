const { io, log } = require("lastejobb")
const config = require("../../config")
const typesystem = require("@artsdatabanken/typesystem")

let vo = io.readJson("./naturvern/naturvernområde.json")

function kodeFraNavn(navn) {
  const kode = tittel2Kode[navn.toLowerCase()]
  if (!kode) throw new Error(`Finner ikke kode for '${navn}'`)
  return kode
}

function relasjon(e, kant, kode, kantRetur, erSubset = true) {
  for (const rl of e.relasjon) if (rl.kode === kode) return

  const rel = {
    kode: kode,
    kant: kant,
    kantRetur: kantRetur || "Naturvernområde"
  }
  if (erSubset) rel.erSubset = true
  e.relasjon.push(rel)
}

function fjernRelasjon(e, kode) {
  for (let i = 0; i < e.relasjon.length; i++)
    if (e.relasjon[i].kode === kode) {
      e.relasjon.splice(i, 1)
      break
    }
}

function kobleForvaltningsmyndighet(kode, e) {
  if (e.data.forvaltningsmyndighet !== "fylkesmann") return
  const regexFylke = /VV-AO-(\d\d)/g
  let fylke = []
  e.relasjon.forEach(r => {
    const match = regexFylke.exec(r.kode)
    if (match) fylke.push(match[1])
  })
  //  if (kode === "VV_171") log.warn(fylke)
  if (fylke.length !== 1) return
  relasjon(e, "forvaltes av", "VV-FM-FM-" + fylke[0], "forvalter")
  fjernRelasjon(e, "VV-FM-FM")
}

function map(vo) {
  let r = {}
  const kode = vo.kode
  let e = {
    tittel: {
      nb: vo.navn.offisielt
    },
    infoUrl: vo.lenke.naturbase, // TODO: Fjern
    lenke: vo.lenke,
    relasjon: [],
    data: {
      ...vo,
      areal: Math.round(multiPolygonArea(vo.geometry.coordinates))
    }
  }
  e.betegnelse = { nb: vo.verneform.navn.nb }

  relasjon(e, "Verneform", vo.verneform.kode)
  relasjon(e, "Verneplan", vo.verneplan.kode)
  relasjon(
    e,
    "forvaltes av",
    kodeFraNavn(vo.forvaltning.ansvarlig.tittel.nb),
    "forvalter"
  )
  if (vo.vurdering.truet.kode) {
    relasjon(e, "Truet vurdering", vo.vurdering.truet.kode)
  }

  if (vo.vurdering.iucn) relasjon(e, "IUCN", vo.vurdering.iucn.kode)
  if (vo.revisjon.dato.førstvernet)
    relasjon(
      e,
      "Ble vernet i år",
      "VV-VT-" + vo.revisjon.dato.førstvernet.substring(0, 4)
    )

  if (vo.kommune) {
    vo.kommune.forEach(kommune => {
      const fnr = kommune.substring(0, 2)
      const knr = kommune.substring(2)
      relasjon(e, "Ligger i kommune", "VV-AO-" + fnr + "-" + knr)
      relasjon(e, "Ligger i fylke", "VV-AO-" + fnr)
    })
  }
  kobleForvaltningsmyndighet(kode, e)
  r[kode] = e
}

const år = {}
vo.items.forEach(o => {
  const vernedato = o.revisjon.dato.førstvernet || o.revisjon.dato.vernet
  if (!vernedato) return log.warn("Mangler dato for vern: " + o.lenke.naturbase)
  const y = vernedato.substring(0, 4)
  år[y] = år[y] + 1 || 1
})

vo.items.forEach(vo => map(vo))
io.skrivDatafil(__filename, r)

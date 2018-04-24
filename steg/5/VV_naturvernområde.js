const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")
const koder = require("../../lib/koder")

let vo = io.lesDatafil("VV_med_kommune")
let vvKoder = io.lesKildedatafil("VV_naturvernområde")

function invert(o) {
  let r = {}
  Object.keys(vvKoder).map(key => {
    const o = vvKoder[key]
    const tittel = o.tittel.nb
    r[tittel] = key
  })
  return r
}

const tittel2Kode = invert(vvKoder)

let r = {}

function lagRelasjonerForvaltningsmyndighet(props) {}

function polygonArea(points) {
  const numPoints = points.length
  let area = 0
  let prev = points[numPoints - 1]
  for (let i = 0; i < numPoints; i++) {
    let cur = points[i]
    area += (prev[0] + cur[0]) * (prev[1] - cur[1])
    prev = cur
  }
  return area / 2
}

function multiPolygonArea(geometries) {
  let area = 0
  if (Array.isArray(geometries[0][0]))
    geometries.forEach(geom => (area += multiPolygonArea(geom)))
  else return polygonArea(geometries)
  return area
}

function kodeFraNavn(navn) {
  const kode = tittel2Kode[navn]
  if (!kode) throw new Error(`Finner ikke kode for '${navn}'`)
  return kode
}

function ordNummer(s, index) {
  if (!s) return null
  return s.split(" ")[index]
}

function map(vo) {
  const props = vo.properties
  const iid = parseInt(props.IID.substring(2))
  const kode = config.kodesystem.prefix.verneområde + iid
  let e = {
    tittel: { nb: props.OMRADENAVN },
    infoUrl: config.infoUrl.verneområde + props.IID,
    foreldre: [],
    relasjon: [],
    data: {
      areal: Math.round(multiPolygonArea(vo.geometry.coordinates)),
      vernedato: props.VERNEDATO,
      verneform: koder.capitalizeTittel(props.VERNEFORM),
      verneplan: props.VERNEPLAN,
      forvaltningsmyndighet: props.FORVALTNI,
      iucn: ordNummer(props.IUCN, 1),
      mobLandPrioritet: ordNummer(props.MOBLANDPRI, 0)
    }
  }
  e.relasjon.push(kodeFraNavn(e.data.verneform))
  e.relasjon.push(kodeFraNavn(e.data.verneplan))
  e.relasjon.push(kodeFraNavn(e.data.forvaltningsmyndighet))
  if (props.TRUETVURD) {
    e.data.truetvurdering = props.TRUETVURD
    e.relasjon.push(kodeFraNavn(e.data.truetvurdering))
  }
  e.relasjon.push("VV_PA-" + e.data.iucn)
  e.relasjon.push("VV_ML-" + e.data.mobLandPrioritet)
  if (new Date(props.DATO_REVID).getFullYear() > 1900)
    e.data.revisjonsdato = props.DATO_REVID
  if (props.kommune) {
    props.kommune.forEach(kommune => {
      const fnr = kommune.substring(0, 2)
      const knr = kommune.substring(2)
      const kommunekode =
        config.kodesystem.prefix.administrativtOmråde + fnr + "-" + knr

      e.relasjon.push(kommunekode)
      e.foreldre.push(kommunekode + "-VV")
      const fylkekode = config.kodesystem.prefix.administrativtOmråde + fnr
      if (!(fylkekode in e.relasjon)) {
        e.relasjon.push(fylkekode)
        e.foreldre.push(fylkekode + "-VV")
      }
    })
  }
  //  if(Object.keys(r).length < 3)
  r[kode] = e
}

function groupByKeys(filterFn) {
  let r = {}
  Object.keys(vo).forEach(key => {
    const o = vo[key]
    const k = filterFn(o)
    r[k] = r[k] + 1 || 1
  })
  return r
}

let manglerNøkler = false

function finnManglendeNøkler(fn, prefix) {
  const keys = Object.keys(groupByKeys(vo => fn(vo.properties)))
  keys.forEach(key => {
    const tittel = koder.capitalizeTittel(key)
    if (!tittel2Kode[tittel]) {
      manglerNøkler = true
      console.log(`"${prefix}-???": {"tittel": {"nb": "${tittel}" }},`)
    }
  })
}

finnManglendeNøkler(p => p.FORVALTNI, "VV_FM")
finnManglendeNøkler(p => p.VERNEPLAN, "VV_VP")
finnManglendeNøkler(p => p.VERNEFORM, "VV_VF")
finnManglendeNøkler(p => p.TRUETVURD, "VV_TV")

if (manglerNøkler)
  log.warn(
    "Nøklene over mangler i typesystemet.  Legg dem inn i VV_naturvernområde.json manuelt."
  )

Object.keys(vo).forEach(key => map(vo[key]))

io.skrivDatafil(__filename, r)

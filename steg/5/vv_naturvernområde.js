const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")
const koder = require("@artsdatabanken/typesystem")

let vo = io.lesDatafil("vv_med_kommune")
let vvKoder = io.lesKildedatafil("vv_naturvernområde")

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

function relasjon(e, kategori, kode) {
  if (!e.relasjon[kategori]) e.relasjon[kategori] = {}
  e.relasjon[kategori][kode] = {}
}

function førsteBokstavStor(s) {
  return s[0].toUpperCase() + s.slice(1)
}

function map(vo) {
  const props = vo.properties
  const iid = parseInt(props.IID.substring(2))
  const kode = config.kodesystem.prefix.verneområde + iid
  let e = {
    tittel: {
      nb: props.OMRADENAVN
    },
    infoUrl: config.infoUrl.verneområde + props.IID,
    foreldre: [],
    relasjon: {},
    data: {
      areal: Math.round(multiPolygonArea(vo.geometry.coordinates)),
      vernedato: props.VERNEDATO,
      verneform: førsteBokstavStor(props.VERNEFORM),
      verneplan: props.VERNEPLAN,
      forvaltningsmyndighet: props.FORVALTNI,
      iucn: ordNummer(props.IUCN, 1),
      mobLandPrioritet: ordNummer(props.MOBLANDPRI, 0)
    }
  }
  e.betegnelse = { nb: e.data.verneform.toLowerCase() }

  relasjon(e, "verneform", kodeFraNavn(e.data.verneform))
  relasjon(e, "verneplan", kodeFraNavn(e.data.verneplan))
  relasjon(
    e,
    "forvaltningsmyndighet",
    kodeFraNavn(e.data.forvaltningsmyndighet)
  )
  if (props.TRUETVURD) {
    e.data.truetvurdering = props.TRUETVURD
    relasjon(e, "truet vurdering", kodeFraNavn(e.data.truetvurdering))
  }
  if (e.data.iucn) relasjon(e, "iucn", "VV_PA-" + e.data.iucn)
  relasjon(e, "mobLand prioritet", "VV_ML-" + e.data.mobLandPrioritet)
  relasjon(e, "ble vernet i år", "VV_VT-" + e.data.vernedato.substring(0, 4))
  if (new Date(props.DATO_REVID).getFullYear() > 1900)
    e.data.revisjonsdato = props.DATO_REVID
  if (props.kommune) {
    props.kommune.forEach(kommune => {
      const fnr = kommune.substring(0, 2)
      const knr = kommune.substring(2)
      const kommunekode =
        config.kodesystem.prefix.administrativtOmråde + fnr + "-" + knr

      e.foreldre.push(kommunekode + "-VV")
      const fylkekode = config.kodesystem.prefix.administrativtOmråde + fnr
      if (!(fylkekode in e.relasjon)) {
        relasjon(e, "ligger i", fylkekode + "-VV")
      }
    })
  }
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

const år = {}
Object.keys(vo).forEach(key => {
  const o = vo[key]
  const y = o.properties.VERNEDATO.substring(0, 4)
  år[y] = år[y] + 1 || 1
})
Object.keys(år).forEach(år => {
  console.log(`"VV_VT-${år}": { "tittel": { "nb": "Vernet i år ${år}" } },`)
})

Object.keys(vo).forEach(key => map(vo[key]))

io.skrivDatafil(__filename, r)

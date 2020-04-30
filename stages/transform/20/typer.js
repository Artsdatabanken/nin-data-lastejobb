const { io, json } = require("lastejobb")

function readSource() {
  let dataArr = io.readJson("build/metabase.json").items
  const data = json.arrayToObject(dataArr, {
    uniqueKey: "kode",
    removeKeyProperty: false
  })
  return data
}

const prefixes = ["AO", "AR", "NN-LA", "NN-NA", "OR", "VV", "RL"]
const data = readSource()
prefixes.forEach(prefix => {
  skrivFil(prefix)
})

function skrivFil(prefix) {
  if (!data[prefix]) throw new Error("Unknown prefix " + prefix)
  const titler = data[prefix].tittel
  tittel = titler.sn || titler.nb
  const dok = {
    meta: {
      tittel: { nb: tittel },
      url: `https://data.artsdatabanken.no/${tittel}/metadata_med_undertyper.json`
    },
    items: []
  }

  // Ta med alle overordnede koder til rot
  const node = data[prefix]
  node.overordnet.forEach(ookode => {
    const node = data[ookode.kode]
    dok.items.push(node)
  })

  Object.keys(data).forEach(kode => {
    const node = data[kode]
    //    fyllPåMedSøsken(node)
    if (kode.indexOf(prefix) === 0) dok.items.push(node)
  })

  io.skrivBuildfil(prefix, dok)
}

function fyllPåMedSøsken(node) {
  if (node.overordnet.length <= 0) return
  const forelderkode = node.overordnet[0].kode
  if (!forelderkode) debugger
  const forelder = data[forelderkode]
  const søsken = forelder.barn
  node.søsken = søsken
}

const { io } = require("lastejobb")

let data = io.lesBuildfil("metabase")

const prefixes = ["AO", "AR", "NN-LA", "NN-NA", "OR", "VV", "RL"]

prefixes.forEach(prefix => {
  skrivFil(prefix)
})

function skrivFil(prefix) {
  if (!data[prefix]) throw new Error("Unknown prefix " + prefix)
  const titler = data[prefix].tittel
  tittel = titler.la || titler.nb
  const dok = {
    meta: {
      tittel: tittel,
      url: `https://data.artsdatabanken.no/${tittel}/metadata_med_undertyper.json`
    },
    data: []
  }

  // Ta med alle overordnede koder til rot
  const node = data[prefix]
  node.overordnet.forEach(ookode => {
    const node = data[ookode.kode]
    dok.data.push(node)
  })

  Object.keys(data).forEach(kode => {
    const node = data[kode]
    fyllPåMedSøsken(node)
    if (kode.indexOf(prefix) === 0) dok.data.push(node)
  })

  io.skrivBuildfil(prefix + "/" + prefix, dok)
}

function fyllPåMedSøsken(node) {
  if (node.overordnet.length <= 0) return
  const forelderkode = node.overordnet[0].kode
  if (!forelderkode) debugger
  if (!data[forelderkode]) debugger
  const forelder = data[forelderkode]
  const søsken = forelder.barn
  node.søsken = søsken
}

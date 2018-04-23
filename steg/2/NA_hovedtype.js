const config = require("../../config")
const io = require("../../lib/io")

let hovedtyper = io.lesKildedatafil(config.datakilde.NA_hovedtyper)
let mi = io.lesDatafil("MI_variasjon")

function fromCsv(csv) {
  csv = csv.trim()
  if (!csv) return []
  return csv.split(",").map(kode => prefix.miljøvariabel + kode)
}

const prefix = config.kodesystem.prefix
r = {}
hovedtyper.forEach(ht => {
  let me = {}
  me.nivå = "hovedtype"
  const hg = parseInt(ht["Kunnskapsgrunnlag - Hovedtypen generelt"])
  const gi = parseInt(ht["Kunnskapsgrunnlag - Grunntypeinndelingen"])
  me.kunnskap = {
    inndeling: {
      kode: prefix.kunnskap + "-GI" + gi,
      verdi: gi
    },
    generelt: { kode: prefix.kunnskap + hg, verdi: hg }
  }
  me.lkm = {
    d: fromCsv(ht.dLKM),
    h: fromCsv(ht.hLKM),
    t: fromCsv(ht.tLKM),
    u: fromCsv(ht.uLKM)
  }
  me.definisjonsgrunnlag = {}
  me.definisjonsgrunnlag.kode = prefix.definisjonsgrunnlag + ht["GrL"].trim()
  me.definisjonsgrunnlag.tittel = { nb: ht["Definisjonsgrunnlag-tekst"] }
  me.definisjonsgrunnlag.undertittel = { nb: ht["Definisjonsgrunnlag"] }
  me.prosedyrekategori = {}
  me.prosedyrekategori.kode = prefix.prosedyrekategori + ht["PrK"]
  me.prosedyrekategori.tittel = { nb: ht["PrK-tekst"].trim() }
  me.prosedyrekategori.undertittel = { nb: ht["Prosedyrekategori"] }
  me.nin1 = ht["NiN[1] "]
  r[prefix.natursystem + ht.HTK] = me
})

io.skrivDatafil(__filename, r)

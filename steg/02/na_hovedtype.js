const config = require("../../config")
const io = require("../../lib/io")
const typesystem = require("@artsdatabanken/typesystem")

let hovedtyper = io.lesKildedatafil(config.datakilde.na_hovedtype)
let mi = io.lesDatafil("mi_variasjon")

function fromCsv(csv) {
  csv = csv.trim()
  if (!csv) return []
  return csv
    .split(",")
    .map(kode => typesystem.miljøvariabel.prefiks + "-" + kode)
}

const prefiks = typesystem.natursystem.prefiks
const kode_hovedtype = typesystem.natursystem.hovedtype

r = {}
hovedtyper.forEach(ht => {
  let me = {}
  me.nivå = "hovedtype"
  const hg = parseInt(ht["Kunnskapsgrunnlag - Hovedtypen generelt"])
  const gi = parseInt(ht["Kunnskapsgrunnlag - Grunntypeinndelingen"])
  me.kunnskap = {
    inndeling: {
      kode: kode_hovedtype.kunnskap.prefiks + "-GI" + gi,
      verdi: gi
    },
    generelt: { kode: kode_hovedtype.kunnskap.prefiks + hg, verdi: hg }
  }
  me.lkm = {
    d: fromCsv(ht.dLKM),
    h: fromCsv(ht.hLKM),
    t: fromCsv(ht.tLKM),
    u: fromCsv(ht.uLKM)
  }
  me.definisjonsgrunnlag = {}
  me.definisjonsgrunnlag.kode =
    kode_hovedtype.definisjonsgrunnlag.prefiks + "-" + ht["GrL"].trim()
  me.definisjonsgrunnlag.tittel = { nb: ht["Definisjonsgrunnlag-tekst"] }
  me.prosedyrekategori = {}
  me.prosedyrekategori.kode = "NN-NA-LKM-PRK-" + ht["PrK"].toUpperCase()
  me.prosedyrekategori.tittel = { nb: ht["PrK-tekst"].trim() }
  me.nin1 = ht["NiN[1] "]
  r["NN-NA-TI-" + ht.HTK] = me
})

io.skrivDatafil(__filename, r)

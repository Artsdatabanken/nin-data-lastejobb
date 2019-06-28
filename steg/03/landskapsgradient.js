const { io } = require("lastejobb")

let klg = io.lesDatafil("landskapsgradient.csv.json").items

const r = {}

klg.forEach(inn => {
  if (inn.KLG_trinn_kode)
    r["NN-LA-" + hack(inn.KLG_trinn_kode)] = {
      tittel: { nb: inn.Trinn_navn },
      min: inn.verdier_klg_indekser,
      max: inn.verdier_klg_indekser,
      ingress: inn.Beskrivelse_KLG,
      intervall: {
        minTekst: inn.mintekst,
        maxTekst: inn.makstekst,
        min: inn.min,
        max: inn.maks,
        måleenhet: inn.måleenhet
      }
    }
  else {
    r["NN-LA-" + hack(inn.kode)] = {
      tittel: { nb: inn.KLG_Navn },
      måleenhet: inn.måleenhet,
      ingress: inn.Beskrivelse_KLG
    }
  }
})

function hack(kode) {
  kode = kode.replace("RE-", "RE")
  kode = kode.replace("ID-KF", "IDKF")
  kode = kode.replace("AI-KS", "AIKS")
  return kode.split("_").join("-")
}

io.skrivDatafil(__filename, r)

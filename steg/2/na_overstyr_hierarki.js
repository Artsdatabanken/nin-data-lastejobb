const io = require("../../lib/io")
const config = require("../../config")
const typesystem = require("@artsdatabanken/typesystem")

// Grunntyper (eksempel NA_T1-1) henger i kodelista på hovedtypen (NA_T)
// Vi ønsker følgende struktur NA_T -> NA_T1 -> NA_T1-E-1 -> NA_T1-C-1 -> NA_T1-1
// Dette for at grovere nivåer da tar med seg mer spesifikke data og viser også disse dataene.

let grunntyper = io.lesKildedatafil(config.datakilde.na_grunntyper)

let foreldre = {}

function harSammeGrunntyper(ckode, ekode) {
  let cgt = grunntyper[ckode].sort()
  let egt = grunntyper[ekode].sort()
  for (let kode of cgt) if (!egt.includes(kode)) return false
  return true
}

function link(ckode) {
  let ekoder = []
  for (ekode of Object.keys(grunntyper)) {
    if (ekode.match(/-E-/gi))
      if (harSammeGrunntyper(ckode, ekode)) {
        ekoder.push(ekode)
      }
  }

  if (ekoder.length === 0) {
    ekoder = [typesystem.Natursystem.hovedtype(ckode)]
  }
  foreldre[ckode] = ekoder
}

for (let ckode of Object.keys(grunntyper)) {
  if (ckode.match(/-C-/gi)) {
    link(ckode)
    for (let grunntype of grunntyper[ckode]) {
      if (typesystem.Natursystem.hovedtype(grunntype) !== grunntype) {
        foreldre[grunntype] = [ckode]
      }
    }
  }
  if (ckode.match(/-E-/gi)) {
    foreldre[ckode] = [typesystem.Natursystem.hovedtype(ckode)]
  }
}

io.skrivDatafil(__filename, foreldre)

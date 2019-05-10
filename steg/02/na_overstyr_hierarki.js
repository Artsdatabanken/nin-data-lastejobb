const { io } = require("lastejobb")
const config = require("../../config")
const typesystem = require("@artsdatabanken/typesystem")

// Grunntyper (eksempel NA_T1-1) henger i kodelista på hovedtypen (NA_T)
// Vi ønsker følgende struktur NA_T -> NA_T1 -> NA_T1-E-1 -> NA_T1-C-1 -> NA_T1-1
// Dette for at grovere nivåer da tar med seg mer spesifikke data og viser også disse dataene.

let grunntyper = io.readJson(
  "nin-data/" + config.datakilde.na_grunntyper + ".json"
)

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
    ekoder = [typesystem.natursystem.slåOppHovedtype(ckode)]
  }
  foreldre[ckode] = ekoder
}

for (let ckode of Object.keys(grunntyper)) {
  if (ckode.match(/-C-/gi)) {
    link(ckode)
    for (let grunntype of grunntyper[ckode]) {
      if (typesystem.natursystem.slåOppHovedtype(grunntype) !== grunntype) {
        foreldre[grunntype] = [ckode]
      }
    }
  }
  if (ckode.match(/-E-/gi)) {
    foreldre[ckode] = [typesystem.natursystem.slåOppHovedtype(ckode)]
  }
}

io.skrivDatafil(__filename, foreldre)

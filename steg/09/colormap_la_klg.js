const Jimp = require("jimp")
const io = require("../../lib/io")

let koder = io.lesKildedatafil("Natur_i_Norge/Landskap/la_index")
let farger = io.lesDatafil("la_farger")
let la = io.lesDatafil("la")
let klg = io.lesDatafil("la_klg")

Object.keys(klg).forEach(kode => lagPalett(kode))

const lkm2type = lkmTilType()

function lkmTilType() {
  const r = {}
  Object.keys(la).forEach(kode => {
    const node = la[kode]
    if (node.relasjon)
      node.relasjon.forEach(rel => {
        if (!r[rel.kode]) r[rel.kode] = []
        r[rel.kode].push(kode)
      })
  })
  return r
}

function lagPalett(kode) {
  new Jimp(512, 1, 0xffffffff, (err, image) => {
    fargeleggAlle(image, kode)
    image.write("./data/" + kode + ".palette.png")
  })
}

function fargeleggAlle(image, rotkode) {
  Object.keys(klg).forEach(klgKode => {
    if (klgKode.startsWith(rotkode)) fargelegg(image, klgKode)
  })
}

function fargelegg(image, klgKode) {
  const typer = lkm2type[klgKode]
  typer.forEach(type => {
    const index = koder[type]
    if (index) settFarge(image, klgKode, index)
  })
}

function settFarge(image, kode, x) {
  if (!farger[kode]) {
    console.log("Mangler farge: " + kode)
    return
  }
  const color = Jimp.cssColorToHex(farger[kode].farge)
  image.setPixelColor(color, x, 0)
}

const Jimp = require("jimp")
const io = require("../../lib/io")

let koder = io.lesKildedatafilOld("Natur_i_Norge/Landskap/la_index")
let meta = io.lesDatafil("metabase_med_farger")
let hierarki = io.lesDatafil("kodehierarki")
const barnAv = hierarki.barn

const klg2type = {}

Object.keys(meta).forEach(kode => {
  if (!kode.startsWith("NN-LA-TI")) return
  const node = meta[kode]
  if (!node.gradient) return
  if ((barnAv[kode] || []).length > 0) return // Kun løvnoder
  const klger = node.gradient["NN-LA-KLG"].barn
  Object.values(klger).forEach(klg => {
    if (klg.kode.startsWith("NN-LA-TI-AP")) return
    klg.trinn.forEach(trinn => {
      if (!trinn.på) return
      const typer = klg2type[trinn.kode] || []
      typer.push(kode)
      klg2type[trinn.kode] = typer
    })
  })
})

lagPalett("NN-LA-KLG")
lagPalett("NN-LA-TI")

function lagPalett(kode) {
  makePal(kode)
  const barn = barnAv[kode] || []
  barn.forEach(bkode => lagPalett(bkode))
}

function makePal(kode) {
  new Jimp(512, 8, 0xffffffff, (err, image) => {
    //  const color = Jimp.cssColorToHex("rgba(255,255,255,0.0)")
    //  for (let y = 0; y < 8; y++) image.setPixelColor(color, 0, y)
    for (let nivå = 1; nivå < 9; nivå++) fyllNivå(kode, nivå, image, nivå - 1)
    image.write(`data/${kode}.palette.png`)
  })
}

function fyllNivå(kode, nivå, image, y, overstyrMedFargeFrakode) {
  Object.keys(koder).forEach(ikode => {
    const index = koder[ikode]
    if (!ikode.startsWith(kode)) return
    settFarge(image, overstyrMedFargeFrakode || kode, index, y)
  })
  if (nivå > 1) {
    const barn = barnAv[kode] || []
    barn.forEach(barn => fyllNivå(barn, nivå - 1, image, y))
    const typer = klg2type[kode] || []
    typer.forEach(barn => fyllNivå(barn, nivå - 1, image, y, kode))
  }
}

function settFarge(image, kode, x, y) {
  if (!meta[kode]) {
    console.log("Mangler farge: " + kode)
    return
  }
  const farge = meta[kode].farge
  const color = Jimp.cssColorToHex(farge)
  image.setPixelColor(color, x, y)
}

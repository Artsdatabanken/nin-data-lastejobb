const Jimp = require("jimp")
const io = require("../../lib/io")

let koder = io.lesKildedatafilOld("Natur_i_Norge/Landskap/la_index")
let meta = io.lesDatafil("metabase_med_farger")

new Jimp(512, 8, 0xffffffff, (err, image) => {
  //  const color = Jimp.cssColorToHex("rgba(255,255,255,0.0)")
  //  for (let y = 0; y < 8; y++) image.setPixelColor(color, 0, y)
  for (let nivå = 1; nivå < 9; nivå++) fyllNivå(nivå, image, nivå - 1)
  image.write("data/LA.palette.png")
})

function fyllNivå(nivå, image, y) {
  Object.keys(koder).forEach(kode => {
    const index = koder[kode]
    let dybde = 0
    //    if (kode === "NN-LA-TI-M-A" && nivå === 4) debugger
    while (true) {
      dybde = kode.split("-").length
      if (dybde <= nivå) break
      const xoo = meta[kode]
      const oo = meta[kode].foreldre
      kode = oo[0]
    }
    settFarge(image, kode, index, y)
  })
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

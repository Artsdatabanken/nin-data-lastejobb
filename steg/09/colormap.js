const Jimp = require("jimp")
const io = require("../../lib/io")

let koder = io.lesKildedatafilOld("Natur_i_Norge/Landskap/la_index")
let farger = io.lesDatafil("la_farger")

new Jimp(512, 1, 0xffffffff, (err, image) => {
  if (true)
    Object.keys(koder).forEach(kode => {
      const index = koder[kode]
      settFarge(image, kode, index)
    })

  image.write("LA.palette.png")
})

function settFarge(image, kode, x) {
  if (!farger[kode]) {
    console.log("Mangler farge: " + kode)
    return
  }
  const color = Jimp.cssColorToHex(farger[kode].farge)
  image.setPixelColor(color, x, 0)
}

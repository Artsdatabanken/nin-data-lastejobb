const Jimp = require("jimp")
const io = require("../../lib/io")

let koder = io.lesKildedatafil("la_index")
let farger = io.lesDatafil("la_farger")

new Jimp(512, 1, 0xffffffff, (err, image) => {
  //  for (let x = 0; x < 512; x++) {
  //    if (x % 2) image.setPixelColor(Jimp.rgbaToInt(255, 255, 255, 255), x, 0)
  //    else image.setPixelColor(Jimp.rgbaToInt(255, 0, 0, 255), x, 0)
  // if (x > 255) image.setPixelColor(Jimp.rgbaToInt(255, x - 256, 0, 255), x, 0)
  // else image.setPixelColor(Jimp.rgbaToInt(0, x, 255 - x, 255), x, 0)
  //  }

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
  // console.log(x, kode, farger[kode].farge, color)
  //if (color != 4294967295)
  image.setPixelColor(color, x, 0)
}

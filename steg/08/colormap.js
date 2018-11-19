/*
const Jimp = require("jimp")
const io = require("../../lib/io")

let koder = io.lesDatafil("fargedelta")
let farger = io.lesKildedatafil("farger")

new Jimp(512, 1, 0xffffffff, (err, image) => {
  Object.keys(koder).forEach(kode => {
    const index = koder[kode]
    const color = finnFarge(kode)
    console.log(kode, index, color)
    image.setPixelColor(color, index, 0)
  })
  for (let x = 0; x < 512; x++) {}
  image.write("LA.palette.png")
})

function finnFarge(kode) {
  while (true) {
    if (farger[kode]) return Jimp.cssColorToHex(farger[kode])
    kode = kode.substring(0, kode.length - 1)
  }
}
*/

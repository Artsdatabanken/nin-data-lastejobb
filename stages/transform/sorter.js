main();
function main() {
  function sorteringsnøkkel(kode) {
    kode = kode.replace("+", "Y")
    kode = kode.replace("¤", "Z")
    return kode
  }

  /*
  * Sorterer kodene slik at spesielt gradientverdier havner i rekkefølge
  * fra lav til høy verdi
  */
  function sorterKoder(koder) {
    return koder.sort((a, b) => {
      return sorteringsnøkkel(a) > sorteringsnøkkel(b) ? 1 : -1
    })
  }

  module.exports = sorterKoder
}
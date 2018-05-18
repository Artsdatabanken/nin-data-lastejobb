const io = require("../../lib/io")
const config = require("../../config")
const typesystem = require("@artsdatabanken/typesystem")
const log = require("log-less-fancy")()

let koder = io.lesKildedatafil("nin_program")

function importerProsjekter(prosjekter) {
  for (let key of Object.keys(prosjekter)) {
    log.warn(key)
    const node = prosjekter[key]

    log.warn(node)
    const id = node.navn
    console.log(node.navn)
    const parts = id.replace(/\s/, "_").split("_")

    log.warn(parts)
  }
}

function importerProgram() {
  const program = {}
  for (let key of Object.keys(koder)) {
    const program = koder[key]
    importerProsjekter(program.prosjekter)
    let id = program.navn
    const parts = id.replace(/\s/, "_").split("_")
    log.warn(parts)
    //    log.warn(node.beskrivelse)
  }
  return program
}

const imp = importerProgram()
io.skrivDatafil(__filename, imp)

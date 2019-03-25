const io = require("../../lib/io")
const config = require("../../config")
const typesystem = require("@artsdatabanken/typesystem")
const log = require("log-less-fancy")()

let koder = io.lesKildedatafil("Natur_i_Norge/Natursystem/kartleggingsprogram")

function importerProsjekter(prosjekter) {
  for (let key of Object.keys(prosjekter)) {
    const node = prosjekter[key]
    const id = node.navn
    const parts = id.replace(/\s/, "_").split("_")
  }
}

function importerProgram() {
  const program = {}
  for (let key of Object.keys(koder)) {
    const program = koder[key]
    importerProsjekter(program.prosjekter)
    let id = program.navn
    const parts = id.replace(/\s/, "_").split("_")
  }
  return program
}

const imp = importerProgram()
io.skrivDatafil(__filename, imp)

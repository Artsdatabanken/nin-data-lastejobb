const { io } = require("lastejobb")
const typesystem = require("@artsdatabanken/typesystem")

let data = io.lesDatafil("full")
const hierarki = typesystem.lagHierarki(data)
io.skrivDatafil(__filename, hierarki)

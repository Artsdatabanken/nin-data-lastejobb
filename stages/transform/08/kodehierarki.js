const { io } = require("lastejobb")
const typesystem = require("@artsdatabanken/typesystem")

let tre = io.lesDatafil("full")
const hierarki = typesystem.lagHierarki(tre)
io.skrivDatafil(__filename, hierarki)

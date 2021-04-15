const { io } = require("@artsdatabanken/lastejobb")
const typesystem = require("@artsdatabanken/typesystem")

let tre = io.lesTempJson("full")
const hierarki = typesystem.lagHierarki(tre)
io.skrivDatafil(__filename, hierarki)

const { io, url } = require("lastejobb")

let tre = io.lesDatafil("metabase_med_farger")

new url(tre).assignUrls()
io.skrivDatafil(__filename, tre)

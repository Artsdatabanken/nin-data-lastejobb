main();
function main() {
    const { io, url } = require("@artsdatabanken/lastejobb")

    let tre = io.lesTempJson("metabase_med_farger")

    new url(tre).assignUrls()
    io.skrivDatafil(__filename, tre)
}
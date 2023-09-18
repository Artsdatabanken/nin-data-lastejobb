const { archive } = require("@artsdatabanken/lastejobb")

// Download "Natur i Norge" data kildedata - fylke og kommune
archive.downloadAndUntar("https://github.com/Artsdatabanken/kommune/releases/latest/download/kommune.tar.gz")

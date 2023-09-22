const { archive } = require("@artsdatabanken/lastejobb")

// Download "Natur i Norge" data kildedata - fylke og kommune
archive.downloadAndUntar("https://github.com/Artsdatabanken/natursystem-lastejobb/releases/latest/download/natursystem-lastejobb.tar.gz")

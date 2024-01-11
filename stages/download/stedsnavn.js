const { archive } = require("@artsdatabanken/lastejobb")

// Download typer for kategorier av stedsnavn
archive.downloadAndUntar("https://github.com/Artsdatabanken/stedsnavn/releases/latest/download/stedsnavn.tar.gz")

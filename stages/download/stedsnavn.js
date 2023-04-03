const { git } = require("@artsdatabanken/lastejobb")

// Download typer for kategorier av stedsnavn
git.clone("https://github.com/Artsdatabanken/stedsnavn", "temp/stedsnavn")

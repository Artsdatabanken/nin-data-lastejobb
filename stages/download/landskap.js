const { git } = require("@artsdatabanken/lastejobb")

// Download "Natur i Norge" data kildedata - naturvernområder
git.clone("https://github.com/Artsdatabanken/landskap.git", "temp/landskap")

const { git } = require("lastejobb")

// Download "Natur i Norge" data kildedata - naturvernområder
git.clone("https://github.com/Artsdatabanken/naturvern.git", "naturvern")

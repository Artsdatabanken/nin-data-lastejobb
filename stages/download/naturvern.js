const { git, log } = require("lastejobb")

// Download "Natur i Norge" data kildedata - naturvernområder
log.info("Git clone naturvern")
git.clone("https://github.com/Artsdatabanken/naturvern.git", "naturvern")

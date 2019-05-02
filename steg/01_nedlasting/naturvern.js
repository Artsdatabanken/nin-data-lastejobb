const git = require("../../lib/git")

// Download "Natur i Norge" data kildedata - naturvernområder
git.clone("https://github.com/Artsdatabanken/naturvern.git", "naturvern")
git.clone(
  "https://github.com/Artsdatabanken/naturvern-kart.git",
  "naturvern-kart"
)

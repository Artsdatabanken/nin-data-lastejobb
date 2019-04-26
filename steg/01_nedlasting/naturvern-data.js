const config = require("../../config")
const git = require("../../lib/git")

// Download "Natur i Norge" data kildedata - naturvernområder
git.clone(
  "https://github.com/Artsdatabanken/naturvern-data.git",
  "naturvern-data"
)

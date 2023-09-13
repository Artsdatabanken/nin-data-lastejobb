const { config, http, processes } = require("@artsdatabanken/lastejobb")
const path = require('path')

async function untar(tarFileName) {
    const isGzipped = path.extname(tarFileName) === '.gz'
    await processes.exec('tar', [
        '-xvf' + (isGzipped ? 'z' : ''), config.getTempPath(tarFileName),
        '--one-top-level',
        '-C ' + config.getTempPath(),
    ]);
}

async function downloadAndUntar(url) {
    const tarFileName = path.basename(new URL(url).pathname);
    await http.downloadBinary(url, tarFileName);
    untar(tarFileName)
}

// Download "Natur i Norge" data kildedata - fylke og kommune
//git.clone("https://github.com/Artsdatabanken/kommune.git", "temp/kommune")
downloadAndUntar("https://github.com/Artsdatabanken/kommune/releases/latest/download/artifacts.tar")

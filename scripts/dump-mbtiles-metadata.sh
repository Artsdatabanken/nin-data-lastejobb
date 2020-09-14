#/bin/bash
export NVM_DIR=$HOME/.nvm;
source $NVM_DIR/nvm.sh;
nvm use 11
/home/grunnkart/.nvm/versions/node/v11.9.0/bin/npx dump-mbtiles-metadata ~/tilesdata >~/tilesdata/index.json

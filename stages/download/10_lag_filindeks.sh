set -e

scp scripts/dump-mbtiles-metadata.sh grunnkart@hydra:~/
ssh grunnkart@hydra ./dump-mbtiles-metadata.sh

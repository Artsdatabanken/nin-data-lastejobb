node steg/04/farger.js 
node steg/08/la_farger.js 
node steg/09/colormap.js 
scp LA.palette.png grunnkart@hydra:tilesdata/indexed/
scp LA.palette.png grunnkart@hydra:tilesdata/indexed/LA-KLG.palette.png
source=LA.palette.png
cp -a -- "$source" "$source-$(date +"%m-%d-%y-%r")"
convert LA.palette.png -sample 512x32\! 512.png 
cp 512.png ../ratatouille/public/
#gthumb -f 512.png

#!/bin/bash -e
# Seeds the complete set of mbtiles for all layers and renders all missing overview zoom levels

export PGPASSWORD=postgres

for d in $PWD/../temp/test/0/*/; do
    cat $d | psql -h localhost -p 5432 forvaltningsportal-postgres -U postgres -w -c "COPY temp (data) FROM STDIN;"
done

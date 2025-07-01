#!/bin/bash
set -e

# Ensure persistent database exists
if [ ! -f /app/data/terminologue.sqlite ]; then
    echo "Initializing SQLite database from template"
    cp /app/templates/terminologue.template.sqlite /app/data/terminologue.sqlite
fi

# Ensure persistent config exists
if [ ! -f /app/website/siteconfig.json ]; then
    echo "Initializing siteconfig from template"
    cp /app/templates/siteconfig.template.json /app/data/siteconfig.json
fi

# Only run init.js if .initialized is missing
if [ ! -f /app/data/.initialized ]; then
    cd /app/website
    node init.js
    touch /app/data/.initialized
fi

exec "$@"
#!/bin/bash
set -e

# Copy template DB if missing in volume
if [ ! -f /app/data/terminologue.sqlite ]; then
    cp /app/templates/terminologue.template.sqlite /app/data/terminologue.sqlite
fi

# Copy config template if missing
if [ ! -f /app/website/siteconfig.json ]; then
    cp /app/templates/siteconfig.template.json /app/website/siteconfig.json
fi

# Run init.js on first launch
if [ ! -f /app/data/.initialized ]; then
    cd /app/website
    node init.js
    touch /app/data/.initialized
fi

exec "$@"
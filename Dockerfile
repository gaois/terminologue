FROM node:20-slim

ENV NODE_ENV=production \
    PORT=80

RUN apt-get update && \
    apt-get install -y sqlite3 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY website ./website
COPY data ./data

RUN mkdir /app/templates && \
    cp data/terminologue.template.sqlite /app/templates/ && \
    cp website/siteconfig.template.json /app/templates/

WORKDIR /app/website
RUN npm install --omit=dev

EXPOSE 80

VOLUME ["/app/data"]

WORKDIR /app/website

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "terminologue.js"]
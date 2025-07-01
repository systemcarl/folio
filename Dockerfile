# syntax=docker/dockerfile:1

FROM node:24-alpine

ARG PORT=3000

USER node
WORKDIR /app

COPY --chown=node:node app/package*.json ./
COPY --chown=node:node app/build ./build

RUN npm install --omit=dev --no-audit

EXPOSE ${PORT:-3000}

CMD ["node", "build", "--port", "${PORT}"]

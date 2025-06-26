# syntax=docker/dockerfile:1

FROM node:24-alpine

ARG PORT=3000
ARG SOURCE=""
ARG VERSION

LABEL org.opencontainers.image.source=${SOURCE}
LABEL org.opencontainers.image.version=${VERSION}
LABEL org.opencontainers.image.license=MIT

USER node
WORKDIR /app

COPY --chown=node:node app/package*.json ./
COPY --chown=node:node app/build ./build

RUN npm install --omit=dev --no-audit

EXPOSE ${PORT:-3000}

CMD ["node", "build", "--port", "${PORT}"]

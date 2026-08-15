FROM node:20-alpine AS base
WORKDIR /usr/src/app

COPY app/package.json ./
RUN npm install --omit=dev

COPY app/ ./

# Build-time args baked in so /version reflects the real deploy
ARG GIT_SHA=unknown
ARG DEPLOYED_AT=unknown
ENV GIT_SHA=$GIT_SHA
ENV DEPLOYED_AT=$DEPLOYED_AT

# Run as non-root — standard production hardening
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/healthz || exit 1

CMD ["node", "server.js"]
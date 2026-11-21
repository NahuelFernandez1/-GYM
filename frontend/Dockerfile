FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
# package-lock.json is out of sync with package.json; Render uses npm install too.
RUN npm install
COPY . .
# Same origin as the API: Caddy proxies /api to the backend, so no CORS and no hardcoded host.
ENV REACT_APP_API_URL=/api
RUN npm run build

FROM caddy:2.8.4-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/build /srv

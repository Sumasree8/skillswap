# ─── SkillSwap Frontend ─────────────────────────────────────────────────────
# Build the Vite app, then serve the static bundle with nginx.
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# VITE_API_URL is left empty so the app uses same-origin /api and /socket.io,
# which nginx proxies to the backend (see nginx.conf).
RUN npm run build

FROM nginx:1.27-alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Frontend Dockerfile (multi-stage: build with node, serve with nginx)
# Stage 1: build
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Basic nginx config: use default server; listening on port 80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

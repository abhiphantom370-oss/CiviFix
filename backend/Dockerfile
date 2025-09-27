# Backend Dockerfile (Node.js)
FROM node:18-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY src ./src
# Ensure uploads dir exists
RUN mkdir -p /app/uploads

EXPOSE 4000
CMD ["node", "src/server.js"]

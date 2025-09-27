# CivicFix — Docker Compose Setup

This branch adds a Docker Compose setup to run the CivicFix frontend, backend and a MongoDB instance together.

Files added:
- `docker-compose.yml` — sets up services for mongo, backend and frontend
- `backend/Dockerfile` — containerizes the backend
- `frontend/Dockerfile` — multi-stage build: build (node) -> serve (nginx)
- `.env.example` — example environment variables
- `.dockerignore` files for frontend and backend

Quick start (from repository root):

1. Build and start services:
   ```bash
   docker-compose up --build
   ```

2. After startup:
   - Backend API: http://localhost:4000
   - Frontend UI: http://localhost:5173

Notes:
- The backend uses `./backend/uploads` as a mounted volume so uploaded images persist locally.
- The backend service points to the `mongo` service via `MONGO_URI=mongodb://mongo:27017/civicfix` inside the compose network.
- If you want to run the backend directly (outside Docker), set `MONGO_URI` to your MongoDB connection string and run `node src/server.js`.
- For production deployments, consider:
  - Using a managed MongoDB instance (Atlas) or a persistent volume with backups.
  - Setting proper environment variables (secrets, CORS origins).
  - Adding a reverse proxy (Traefik or Nginx) and TLS termination.

Troubleshooting:
- If the backend cannot connect to MongoDB, check `docker-compose logs mongo` and ensure container started successfully.
- To view backend logs:
  ```bash
  docker-compose logs -f backend
  ```
- To rebuild only the backend:
  ```bash
  docker-compose build backend && docker-compose up -d backend
  ```

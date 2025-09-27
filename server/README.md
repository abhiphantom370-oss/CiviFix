Server for CivicFix: Express + LowDB + Multer.

Scripts:
- dev: nodemon src/index.js
- start: node src/index.js

ENV:
- PORT (default 4000)

Endpoints:
- GET /health
- GET /issues
- POST /issues
- POST /issues/:id/upvote
- POST /issues/:id/comment
- POST /upload (multipart, field: files)

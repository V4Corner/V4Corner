# V4Corner

V4Corner is the class website for Vehicle 4. It offers a clean, extendable space for sharing class news, blogs, and project highlights. This monorepo includes a React frontend, FastAPI backend, and a simple SQLite setup so a 5-person student team can collaborate quickly.

## Structure
- `frontend/`: React + TypeScript + Vite app
- `backend/`: FastAPI service with SQLAlchemy models and Pydantic schemas
- `database/`: Notes about the default SQLite choice
- `docker/`: Dockerfiles for frontend and backend images
- `docker-compose.yml`: Runs frontend + backend together (SQLite uses a file, no separate container)

## Run frontend locally
```bash
cd frontend
npm install
npm run dev
```
The dev server runs on http://localhost:3000.

## Run backend locally
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
The API lives at http://localhost:8000.

## Run everything with Docker Compose
```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

SQLite writes to `backend/v4corner.db` by default. Adjust environment variables and connection strings as you grow (e.g., switch to PostgreSQL).

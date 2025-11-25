# Database

SQLite is the default for local development because it needs no extra services and works well with Docker bind mounts. The database file lives at `backend/v4corner.db`.

To switch to PostgreSQL later:
- Update `DATABASE_URL` in `backend/database.py` (e.g., `postgresql+psycopg2://user:pass@db:5432/v4corner`).
- Add a db service in `docker-compose.yml` and install the appropriate driver in `backend/requirements.txt`.

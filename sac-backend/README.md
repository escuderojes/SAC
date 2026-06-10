# Sistema SAC Backend

Backend FastAPI para el Sistema de Solicitudes de Accion Correctiva.

## Requisitos

- Python 3.11+
- PostgreSQL en Supabase para produccion
- Para pruebas locales, si no configuras `DATABASE_URL`, usa SQLite `sac.db`

## Instalacion local

```powershell
cd D:\SAC\sac-backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Edita `.env` y coloca tu `DATABASE_URL` de Supabase cuando lo tengas.

## Seed inicial

```powershell
python seed.py
```

Usuarios de prueba:

- `mquispe@ucv.edu.pe` / `admin123` - coordinador
- `responsable@ucv.edu.pe` / `admin123` - responsable
- `auditor@ucv.edu.pe` / `admin123` - auditor

## Ejecutar API

```powershell
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Swagger UI:

```text
http://127.0.0.1:8000/docs
```

## Frontend

El frontend en `D:\SAC` espera la API en:

```text
http://localhost:8000
```

Si usas otro host, define `VITE_API_BASE_URL` antes de ejecutar Vite.

## Supabase

1. Crea un proyecto en Supabase.
2. Copia la cadena `DATABASE_URL` de PostgreSQL.
3. Colocala en `.env`.
4. Ejecuta `python seed.py`.
5. Levanta con `uvicorn main:app --reload`.

Para el prototipo se usa `SQLModel.metadata.create_all(engine)`. Alembic queda preparado como dependencia para migraciones futuras.

import os
from typing import Generator

from dotenv import load_dotenv
from sqlalchemy import inspect, text
from sqlmodel import Session, SQLModel, create_engine

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sac.db")
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
if DATABASE_URL.startswith("postgresql+psycopg://"):
    DATABASE_URL = DATABASE_URL.split("?")[0]

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)
    run_light_migrations()


def run_light_migrations() -> None:
    inspector = inspect(engine)
    table_names = inspector.get_table_names()
    if "sac" not in table_names:
        return
    sac_columns = {col["name"] for col in inspector.get_columns("sac")}
    with engine.begin() as conn:
        if "procedimiento" not in sac_columns:
            conn.execute(text("ALTER TABLE sac ADD COLUMN procedimiento VARCHAR DEFAULT ''"))
        if "procedimiento" in table_names:
            indexes = {idx["name"] for idx in inspector.get_indexes("procedimiento")}
            if "ix_procedimiento_codigo" in indexes:
                conn.execute(text("DROP INDEX ix_procedimiento_codigo"))


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

import uuid
from datetime import date, datetime, timezone
from typing import List, Optional

from sqlalchemy import Column, DateTime, Index, JSON
from sqlmodel import Field, Relationship, SQLModel


def new_uuid() -> str:
    return str(uuid.uuid4())


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class SAC(SQLModel, table=True):
    __tablename__ = "sac"
    __table_args__ = (
        Index("ix_sac_campus_iniciales", "campus_iniciales"),
        Index("ix_sac_estado", "estado"),
        Index("ix_sac_fecha_compromiso", "fecha_compromiso"),
        Index("ix_sac_responsable", "responsable"),
    )

    id: str = Field(default_factory=new_uuid, primary_key=True)
    codigo: str = Field(index=True, unique=True)
    code: str = Field(index=True)
    campus: str = Field(default="UCV — Campus Lima Norte")
    campus_iniciales: str = Field(default="LN")

    proceso: str = ""
    proceso_abbr: str = ""
    proceso_sgc: str = ""
    procedimiento: str = ""
    norma: str = "ISO 9001:2015"
    clausula: str = ""
    fuente: str = ""
    fuente_abbr: str = ""
    prioridad: str = "media"

    responsable: str = ""
    responsable_short: str = ""
    originador: str = ""

    fecha_registro: date = Field(default_factory=date.today)
    fecha_compromiso: Optional[date] = None
    fecha_cierre: Optional[date] = None

    estado: str = "pendiente"
    implementacion: int = 0
    eficacia: str = "pe"

    descripcion: str = ""
    descripcion_sub: str = ""
    nc: str = ""
    accion_inmediata: str = ""
    accion_inm_responsable: str = ""
    accion_inm_fecha: Optional[date] = None
    analisis_causa: str = ""
    analisis_whys: List[dict] = Field(default_factory=list, sa_column=Column(JSON))

    timeline_step: int = 1
    timeline_dates: List[str] = Field(default_factory=list, sa_column=Column(JSON))

    verif_impl_desc: str = ""
    verif_impl_por: str = ""
    verif_impl_fecha: Optional[date] = None
    verif_impl_eficacia_desde: str = ""
    verif_efic_docs: str = ""
    verif_efic_eficaz: str = ""
    verif_efic_cierra: str = ""
    verif_efic_por: str = ""
    verif_efic_fecha: Optional[date] = None
    verif_efic_obs: str = ""

    activo: bool = True
    creado_en: datetime = Field(default_factory=utcnow, sa_column=Column(DateTime(timezone=True)))
    actualizado_en: datetime = Field(default_factory=utcnow, sa_column=Column(DateTime(timezone=True)))
    creado_por: Optional[str] = Field(default=None, foreign_key="usuario.id")

    plan_acciones: List["SACPlanAccion"] = Relationship(back_populates="sac")
    historial: List["SACHistorial"] = Relationship(back_populates="sac")


class SACPlanAccion(SQLModel, table=True):
    __tablename__ = "sac_plan_accion"

    id: str = Field(default_factory=new_uuid, primary_key=True)
    sac_id: str = Field(foreign_key="sac.id", index=True)
    orden: int = 1
    desc: str = ""
    responsable: str = ""
    responsable_av: str = ""
    fecha: Optional[date] = None
    estado: str = "pendiente"

    sac: Optional[SAC] = Relationship(back_populates="plan_acciones")


class SACHistorial(SQLModel, table=True):
    __tablename__ = "sac_historial"

    id: str = Field(default_factory=new_uuid, primary_key=True)
    sac_id: str = Field(foreign_key="sac.id", index=True)
    kind: str = "blue"
    icon: str = "file-plus"
    who: str = "Sistema SAC"
    what: str = ""
    em: Optional[str] = None
    created_at: datetime = Field(default_factory=utcnow, sa_column=Column(DateTime(timezone=True)))

    sac: Optional[SAC] = Relationship(back_populates="historial")


class Usuario(SQLModel, table=True):
    __tablename__ = "usuario"

    id: str = Field(default_factory=new_uuid, primary_key=True)
    nombre: str
    email: str = Field(index=True, unique=True)
    password_hash: str
    rol: str = "responsable"
    campus: str = "LN"
    activo: bool = True


class Campus(SQLModel, table=True):
    __tablename__ = "campus"

    iniciales: str = Field(primary_key=True)
    nombre: str


class AreaResponsable(SQLModel, table=True):
    __tablename__ = "area_responsable"

    id: str = Field(default_factory=new_uuid, primary_key=True)
    tipo: str = Field(index=True)
    area: str = Field(index=True, unique=True)
    responsable: str
    cargo: str = ""
    correo: str = ""
    correo_area: str = ""
    activo: bool = True


class Procedimiento(SQLModel, table=True):
    __tablename__ = "procedimiento"

    id: str = Field(default_factory=new_uuid, primary_key=True)
    codigo: str = Field(index=True)
    nombre: str
    activo: bool = True


class ProcesoSGC(SQLModel, table=True):
    __tablename__ = "proceso_sgc"

    id: str = Field(default_factory=new_uuid, primary_key=True)
    nombre: str = Field(index=True, unique=True)
    activo: bool = True

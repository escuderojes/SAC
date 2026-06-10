from datetime import date, datetime
from math import ceil
from typing import Any, List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

FUENTES_VALIDAS = {
    "Auditoria interna", "Auditoría interna",
    "Auditoria externa", "Auditoría externa",
    "Evaluacion plan estrategico", "Evaluación plan estratégico",
    "Salidas no conformes",
    "Revision por direccion", "Revisión por dirección",
    "Satisfaccion del cliente", "Satisfacción del cliente",
    "Medicion y control", "Medición y control",
    "Quejas repetitivas",
    "Otras fuentes",
}
PRIORIDADES_VALIDAS = {"alta", "media", "baja", "Alta", "Media", "Baja"}
CAMPUS_VALIDOS = {"LN", "LE", "LA", "TRU", "PIU", "CHY", "CHM", "HUA", "CAL", "TAR", "MOY"}
ESTADO_LABELS = {
    "pendiente": "Pendiente",
    "analisis": "En analisis",
    "ejecucion": "En ejecucion",
    "verificacion": "En verificacion",
    "cerrada": "Cerrada",
    "noeficaz": "No eficaz",
    "vencida": "Vencida",
}


def parse_date(value: Any) -> Optional[date]:
    if value in (None, ""):
        return None
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        for fmt in ("%Y-%m-%d", "%d/%m/%Y"):
            try:
                return datetime.strptime(value, fmt).date()
            except ValueError:
                pass
    raise ValueError("Fecha invalida. Use YYYY-MM-DD o DD/MM/YYYY.")


def fmt_date(value: Optional[date]) -> str:
    return value.strftime("%d/%m/%Y") if value else ""


def initials(name: str) -> str:
    parts = [p for p in (name or "").replace("—", " ").split() if p and p[0].isalpha()]
    if not parts:
        return ""
    return (parts[0][0] + (parts[-1][0] if len(parts) > 1 else "")).upper()


class PlanAccionBase(BaseModel):
    n: Optional[int] = None
    orden: Optional[int] = None
    desc: str = ""
    responsable: str = ""
    responsable_av: Optional[str] = None
    av: Optional[str] = None
    fecha: Optional[date] = None
    estado: str = "pendiente"

    _fecha = field_validator("fecha", mode="before")(parse_date)


class PlanAccionCreate(PlanAccionBase):
    pass


class PlanAccionUpdate(BaseModel):
    desc: Optional[str] = None
    responsable: Optional[str] = None
    responsable_av: Optional[str] = None
    av: Optional[str] = None
    fecha: Optional[date] = None
    estado: Optional[str] = None

    _fecha = field_validator("fecha", mode="before")(parse_date)


class PlanAccionResponse(PlanAccionBase):
    id: str
    sac_id: str

    model_config = ConfigDict(from_attributes=True)


class HistorialResponse(BaseModel):
    id: str
    sac_id: str
    kind: str
    icon: str
    who: str
    what: str
    em: Optional[str] = None
    created_at: datetime
    when: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class SACBase(BaseModel):
    codigo: Optional[str] = None
    code: Optional[str] = None
    campus: str = "UCV — Campus Lima Norte"
    campus_iniciales: str = "LN"
    proceso: Optional[str] = None
    area: Optional[str] = None
    proceso_abbr: Optional[str] = None
    procesoSGC: Optional[str] = None
    proceso_sgc: Optional[str] = None
    procedimiento: Optional[str] = None
    norma: str = "ISO 9001:2015"
    clausula: str = ""
    fuente: str = ""
    fuente_abbr: Optional[str] = None
    prioridad: str = "media"
    prio: Optional[str] = None
    responsable: str = ""
    responsable_short: Optional[str] = None
    originador: str = ""
    fecha_registro: Optional[date] = None
    fechaReg: Optional[date] = None
    fecha_compromiso: Optional[date] = None
    fechaComp: Optional[date] = None
    estado: Optional[str] = None
    implementacion: Optional[int] = None
    eficacia: Optional[str] = None
    descripcion: str = ""
    descripcion_sub: Optional[str] = None
    descripcionSub: Optional[str] = None
    nc: str = ""
    accion_inmediata: Optional[Any] = None
    analisis_causa: Optional[str] = None
    analisis: Optional[str] = None
    analisis_whys: Optional[List[dict]] = None
    timeline_step: Optional[int] = None
    timeline_dates: Optional[List[str]] = None
    verificacion: Optional[dict] = None
    plan_acciones: Optional[List[PlanAccionCreate]] = None
    planAccion: Optional[List[PlanAccionCreate]] = None

    _fecha_registro = field_validator("fecha_registro", "fechaReg", mode="before")(parse_date)
    _fecha_compromiso = field_validator("fecha_compromiso", "fechaComp", mode="before")(parse_date)

    @field_validator("fuente")
    @classmethod
    def validate_fuente(cls, value: str) -> str:
        if value and value not in FUENTES_VALIDAS:
            raise ValueError("Fuente no valida para el procedimiento SAC.")
        return value

    @field_validator("prioridad", "prio")
    @classmethod
    def validate_prioridad(cls, value: Optional[str]) -> Optional[str]:
        if value and value not in PRIORIDADES_VALIDAS:
            raise ValueError("Prioridad debe ser alta, media o baja.")
        return value

    @field_validator("campus_iniciales")
    @classmethod
    def validate_campus(cls, value: str) -> str:
        if value and value not in CAMPUS_VALIDOS:
            raise ValueError("Campus no valido.")
        return value


class SACCreate(SACBase):
    pass


class SACUpdate(SACBase):
    codigo: Optional[str] = None
    campus: Optional[str] = None
    campus_iniciales: Optional[str] = None
    fuente: Optional[str] = None
    descripcion: Optional[str] = None
    nc: Optional[str] = None


class SACListItem(BaseModel):
    id: str
    codigo: str
    code: str
    campus: str
    campus_iniciales: str
    proceso: str
    procesoAbbr: str
    procesoSGC: str
    procedimiento: str = ""
    responsable: str
    responsableShort: str
    descripcion: str
    descripcionSub: str
    fuente: str
    fechaReg: str
    fechaComp: str
    estado: str
    estadoLabel: str
    implementacion: int
    eficacia: str
    daysLeft: Optional[int]
    prio: str
    prioridad: str
    norma: str
    clausula: str
    originador: str


class SACResponse(SACListItem):
    nc: str
    accion_inmediata: str
    accion_inm_responsable: str
    accion_inm_fecha: str
    analisis_causa: str
    analisis_whys: List[dict]
    timeline_step: int
    timeline_dates: List[str]
    verif_impl_desc: str
    verif_impl_por: str
    verif_impl_fecha: str
    verif_impl_eficacia_desde: str
    verif_efic_docs: str
    verif_efic_eficaz: str
    verif_efic_cierra: str
    verif_efic_por: str
    verif_efic_fecha: str
    verif_efic_obs: str
    plan_acciones: List[PlanAccionResponse] = []
    planAccion: List[PlanAccionResponse] = []
    historial: List[HistorialResponse] = []


class PaginatedSAC(BaseModel):
    items: List[SACListItem]
    total: int
    page: int
    pages: int


class StatsResponse(BaseModel):
    abiertas: int = 0
    vencidas: int = 0
    cerradas_mes: int = 0
    tiempo_promedio_cierre: int = 0
    spark_abiertas: List[int] = Field(default_factory=list)
    spark_vencidas: List[int] = Field(default_factory=list)
    spark_cerradas: List[int] = Field(default_factory=list)
    spark_tiempo: List[int] = Field(default_factory=list)
    abiertasSpark: List[int] = Field(default_factory=list)
    vencidasSpark: List[int] = Field(default_factory=list)
    cerradasSpark: List[int] = Field(default_factory=list)
    tiempoSpark: List[int] = Field(default_factory=list)
    cerradasMes: int = 0
    tiempoPromedioCierre: int = 0


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


def pages_for(total: int, page_size: int) -> int:
    return max(1, ceil(total / max(1, page_size)))

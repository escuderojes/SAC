from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlmodel import Session, col, select

from auth import get_current_user
from database import get_session
from models import SAC, SACHistorial, SACPlanAccion, Usuario, utcnow
from schemas import (
    ESTADO_LABELS,
    PaginatedSAC,
    SACCreate,
    SACListItem,
    SACResponse,
    SACUpdate,
    fmt_date,
    initials,
    pages_for,
    parse_date,
)

router = APIRouter(prefix="/api/sac", tags=["sac"])

CAMPUS_NAMES = {
    "LN": "UCV — Campus Lima Norte",
    "LE": "UCV — Campus Lima Este",
    "LA": "UCV — Campus Lima Ate Vitarte",
    "TRU": "UCV — Campus Trujillo",
    "PIU": "UCV — Campus Piura",
    "CHY": "UCV — Campus Chiclayo",
    "CHM": "UCV — Campus Chimbote",
    "HUA": "UCV — Campus Huaraz",
    "CAL": "UCV — Campus Callao",
    "TAR": "UCV — Campus Tarapoto",
    "MOY": "UCV — Campus Moyobamba",
}

FUENTE_ABBR = {
    "Auditoria interna": "AI",
    "Auditoría interna": "AI",
    "Auditoria externa": "AE",
    "Auditoría externa": "AE",
    "Quejas repetitivas": "QR",
    "Plan estrategico": "PE",
    "Evaluacion plan estrategico": "PE",
    "Evaluación plan estratégico": "PE",
    "Satisfaccion del cliente": "SC",
    "Satisfacción del cliente": "SC",
    "Medicion y control": "MC",
    "Medición y control": "MC",
    "Otras fuentes": "OF",
    "Salidas no conformes": "SN",
    "Revision por direccion": "RD",
    "Revisión por dirección": "RD",
}


def frontend_estado(sac: SAC) -> str:
    if sac.estado != "cerrada" and sac.fecha_compromiso and sac.fecha_compromiso < date.today():
        return "vencida"
    return sac.estado


def days_left(sac: SAC) -> Optional[int]:
    if not sac.fecha_compromiso or sac.estado == "cerrada":
        return None
    return (sac.fecha_compromiso - date.today()).days


def list_item(sac: SAC) -> SACListItem:
    estado = frontend_estado(sac)
    return SACListItem(
        id=sac.id,
        codigo=sac.codigo,
        code=sac.code,
        campus=sac.campus,
        campus_iniciales=sac.campus_iniciales,
        proceso=sac.proceso,
        procesoAbbr=sac.proceso_abbr,
        procesoSGC=sac.proceso_sgc,
        procedimiento=sac.procedimiento,
        responsable=sac.responsable,
        responsableShort=sac.responsable_short,
        descripcion=sac.descripcion,
        descripcionSub=sac.descripcion_sub,
        fuente=sac.fuente,
        fechaReg=fmt_date(sac.fecha_registro),
        fechaComp=fmt_date(sac.fecha_compromiso),
        estado=estado,
        estadoLabel=ESTADO_LABELS.get(estado, estado),
        implementacion=sac.implementacion,
        eficacia=sac.eficacia,
        daysLeft=days_left(sac),
        prio=sac.prioridad,
        prioridad=sac.prioridad,
        norma=sac.norma,
        clausula=sac.clausula,
        originador=sac.originador,
    )


def full_response(sac: SAC) -> SACResponse:
    base = list_item(sac).model_dump()
    plan = [
        {
            "id": p.id,
            "sac_id": p.sac_id,
            "n": p.orden,
            "orden": p.orden,
            "desc": p.desc,
            "responsable": p.responsable,
            "responsable_av": p.responsable_av,
            "av": p.responsable_av,
            "fecha": p.fecha,
            "estado": p.estado,
        }
        for p in sorted(sac.plan_acciones, key=lambda x: x.orden)
    ]
    historial = [
        {
            "id": h.id,
            "sac_id": h.sac_id,
            "kind": h.kind,
            "icon": h.icon,
            "who": h.who,
            "what": h.what,
            "em": h.em,
            "created_at": h.created_at,
            "when": h.created_at.strftime("%d/%m/%Y %H:%M"),
        }
        for h in sorted(sac.historial, key=lambda x: x.created_at, reverse=True)
    ]
    return SACResponse(
        **base,
        nc=sac.nc,
        accion_inmediata=sac.accion_inmediata,
        accion_inm_responsable=sac.accion_inm_responsable,
        accion_inm_fecha=fmt_date(sac.accion_inm_fecha),
        analisis_causa=sac.analisis_causa,
        analisis_whys=sac.analisis_whys or [],
        timeline_step=sac.timeline_step,
        timeline_dates=sac.timeline_dates or [],
        verif_impl_desc=sac.verif_impl_desc,
        verif_impl_por=sac.verif_impl_por,
        verif_impl_fecha=fmt_date(sac.verif_impl_fecha),
        verif_impl_eficacia_desde=sac.verif_impl_eficacia_desde,
        verif_efic_docs=sac.verif_efic_docs,
        verif_efic_eficaz=sac.verif_efic_eficaz,
        verif_efic_cierra=sac.verif_efic_cierra,
        verif_efic_por=sac.verif_efic_por,
        verif_efic_fecha=fmt_date(sac.verif_efic_fecha),
        verif_efic_obs=sac.verif_efic_obs,
        plan_acciones=plan,
        planAccion=plan,
        historial=historial,
    )


def normalize_campus(value: Optional[str]) -> str:
    if not value:
        return "LN"
    if value in CAMPUS_NAMES:
        return value
    if "Lima Norte" in value:
        return "LN"
    return value


def next_code(session: Session, campus_iniciales: str, year: int) -> str:
    pattern = f"%-{year}-{campus_iniciales}%"
    count = session.exec(select(func.count(SAC.id)).where(SAC.code.like(pattern), SAC.activo == True)).one()  # noqa: E712
    return f"{count + 1:02d}-{year}-{campus_iniciales}"


def add_history(session: Session, sac_id: str, who: str, what: str, kind: str = "blue", icon: str = "file-plus", em: Optional[str] = None):
    session.add(SACHistorial(sac_id=sac_id, who=who, what=what, kind=kind, icon=icon, em=em))


def plan_responsable(accion) -> str:
    return accion.responsable or getattr(accion, "resp", None) or ""


def renumber_active_sacs(session: Session, campus: str, year: int) -> None:
    suffix = f"-{year}-{campus}"
    rows = session.exec(
        select(SAC)
        .where(SAC.activo == True, SAC.campus_iniciales == campus, SAC.code.endswith(suffix))  # noqa: E712
        .order_by(SAC.fecha_registro, SAC.creado_en, SAC.id)
    ).all()
    for sac in rows:
        sac.code = f"TMP-{sac.id}"
        sac.codigo = f"TMP-{sac.id}"
        session.add(sac)
    session.flush()
    for index, sac in enumerate(rows, start=1):
        new_code = f"{index:02d}-{year}-{campus}"
        sac.code = new_code
        sac.codigo = f"SAC-{new_code}"
        session.add(sac)


def sac_from_create(payload: SACCreate, session: Session, user: Usuario) -> SAC:
    campus = normalize_campus(payload.campus_iniciales or payload.campus)
    code = (payload.code or (payload.codigo or "").replace("SAC-", "")).strip()
    if not code:
        code = next_code(session, campus, date.today().year)
    codigo = payload.codigo or f"SAC-{code}"
    if not codigo.startswith("SAC-"):
        codigo = f"SAC-{codigo}"
    accion = payload.accion_inmediata if isinstance(payload.accion_inmediata, dict) else {}
    prioridad = (payload.prio or payload.prioridad or "media").lower()
    proceso = payload.proceso or payload.area or ""
    return SAC(
        codigo=codigo,
        code=code,
        campus=payload.campus or CAMPUS_NAMES.get(campus, campus),
        campus_iniciales=campus,
        proceso=proceso,
        proceso_abbr=initials(proceso),
        proceso_sgc=payload.proceso_sgc or payload.procesoSGC or "",
        procedimiento=payload.procedimiento or "",
        norma=payload.norma,
        clausula=payload.clausula,
        fuente=payload.fuente,
        fuente_abbr=payload.fuente_abbr or FUENTE_ABBR.get(payload.fuente, ""),
        prioridad=prioridad,
        responsable=payload.responsable,
        responsable_short=payload.responsable_short or initials(payload.responsable),
        originador=payload.originador,
        fecha_registro=payload.fecha_registro or payload.fechaReg or date.today(),
        fecha_compromiso=payload.fecha_compromiso or payload.fechaComp,
        estado="pendiente",
        implementacion=payload.implementacion or 0,
        eficacia=payload.eficacia or "pe",
        descripcion=payload.descripcion or (payload.nc[:120] if payload.nc else ""),
        descripcion_sub=payload.descripcion_sub or payload.descripcionSub or "",
        nc=payload.nc or "",
        accion_inmediata=accion.get("descripcion", payload.accion_inmediata if isinstance(payload.accion_inmediata, str) else ""),
        accion_inm_responsable=accion.get("responsable", ""),
        accion_inm_fecha=parse_date(accion.get("fecha")) if accion.get("fecha") else None,
        analisis_causa=payload.analisis_causa or payload.analisis or "",
        analisis_whys=payload.analisis_whys or [],
        timeline_step=0,
        timeline_dates=payload.timeline_dates or [],
        creado_por=user.id,
    )


def apply_update(sac: SAC, payload: SACUpdate) -> List[str]:
    changes = []
    data = payload.model_dump(exclude_unset=True)
    mapping = {
        "procesoSGC": "proceso_sgc",
        "fechaReg": "fecha_registro",
        "fechaComp": "fecha_compromiso",
        "descripcionSub": "descripcion_sub",
        "prio": "prioridad",
        "area": "proceso",
    }
    for key, value in data.items():
        if key in {"plan_acciones", "planAccion", "verificacion", "accion_inmediata", "analisis"}:
            continue
        field = mapping.get(key, key)
        if not hasattr(sac, field) or value is None:
            continue
        old = getattr(sac, field)
        if field == "prioridad" and isinstance(value, str):
            value = value.lower()
        if old != value:
            setattr(sac, field, value)
            changes.append(field)
    if isinstance(payload.accion_inmediata, dict):
        accion = payload.accion_inmediata
        sac.accion_inmediata = accion.get("descripcion", sac.accion_inmediata)
        sac.accion_inm_responsable = accion.get("responsable", sac.accion_inm_responsable)
        if accion.get("fecha"):
            sac.accion_inm_fecha = parse_date(accion.get("fecha"))
    if payload.analisis:
        sac.analisis_causa = payload.analisis
    if payload.verificacion:
        ver = payload.verificacion
        key_map = {
            "impl_desc": "verif_impl_desc",
            "impl_verif_por": "verif_impl_por",
            "impl_fecha": "verif_impl_fecha",
            "impl_eficacia_desde": "verif_impl_eficacia_desde",
            "efic_docs": "verif_efic_docs",
            "efic_eficaz": "verif_efic_eficaz",
            "efic_cierra": "verif_efic_cierra",
            "efic_verif_por": "verif_efic_por",
            "efic_fecha": "verif_efic_fecha",
            "efic_obs": "verif_efic_obs",
        }
        for source, target in key_map.items():
            if source in ver:
                value = parse_date(ver[source]) if "fecha" in source and ver[source] else ver[source]
                setattr(sac, target, value)
    if sac.estado == "cerrada" and not sac.fecha_cierre:
        sac.fecha_cierre = date.today()
    sac.actualizado_en = utcnow()
    return changes


@router.get("", response_model=PaginatedSAC)
def list_sacs(
    campus: Optional[str] = None,
    estado: List[str] = Query(default=[]),
    fuente: Optional[str] = None,
    prioridad: Optional[str] = None,
    responsable: Optional[str] = None,
    fecha_inicio: Optional[str] = None,
    fecha_fin: Optional[str] = None,
    fechaInicio: Optional[str] = None,
    fechaFin: Optional[str] = None,
    area: Optional[str] = None,
    procesoSGC: Optional[str] = None,
    procedimiento: Optional[str] = None,
    q: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    session: Session = Depends(get_session),
    _: Usuario = Depends(get_current_user),
):
    stmt = select(SAC).where(SAC.activo == True)  # noqa: E712
    campus_code = normalize_campus(campus)
    if campus:
        stmt = stmt.where(SAC.campus_iniciales == campus_code)
    if estado:
        flat_estado = []
        for item in estado:
            flat_estado.extend([part for part in item.split(",") if part and part != "todas"])
        if flat_estado:
            stmt = stmt.where(col(SAC.estado).in_(flat_estado))
    if fuente:
        stmt = stmt.where(SAC.fuente == fuente)
    if prioridad:
        stmt = stmt.where(SAC.prioridad == prioridad.lower())
    if responsable:
        stmt = stmt.where(SAC.responsable.ilike(f"%{responsable}%"))
    if area:
        stmt = stmt.where(SAC.proceso == area)
    if procesoSGC:
        stmt = stmt.where(SAC.proceso_sgc == procesoSGC)
    if procedimiento:
        stmt = stmt.where(SAC.procedimiento == procedimiento)
    start_date = fecha_inicio or fechaInicio
    end_date = fecha_fin or fechaFin
    if start_date:
        stmt = stmt.where(SAC.fecha_registro >= parse_date(start_date))
    if end_date:
        stmt = stmt.where(SAC.fecha_registro <= parse_date(end_date))
    if q:
        stmt = stmt.where((SAC.descripcion.ilike(f"%{q}%")) | (SAC.nc.ilike(f"%{q}%")))

    total = session.exec(select(func.count()).select_from(stmt.subquery())).one()
    rows = session.exec(
        stmt.order_by(SAC.fecha_registro.desc()).offset((page - 1) * page_size).limit(page_size)
    ).all()
    return PaginatedSAC(items=[list_item(row) for row in rows], total=total, page=page, pages=pages_for(total, page_size))


@router.get("/next-code")
def get_next_code(
    campus_iniciales: Optional[str] = None,
    campus: Optional[str] = None,
    year: int = date.today().year,
    session: Session = Depends(get_session),
):
    campus_code = normalize_campus(campus_iniciales or campus)
    code = next_code(session, campus_code, year)
    return {"code": code, "codigo": f"SAC-{code}"}


@router.get("/{sac_id}", response_model=SACResponse)
def get_sac(sac_id: str, session: Session = Depends(get_session), _: Usuario = Depends(get_current_user)):
    sac = session.get(SAC, sac_id)
    if not sac or not sac.activo:
        raise HTTPException(status_code=404, detail="SAC no encontrada.")
    return full_response(sac)


@router.post("", response_model=SACResponse)
def create_sac(payload: SACCreate, session: Session = Depends(get_session), user: Usuario = Depends(get_current_user)):
    sac = sac_from_create(payload, session, user)
    session.add(sac)
    session.flush()
    plan = payload.plan_acciones or payload.planAccion or []
    for idx, accion in enumerate(plan, start=1):
        responsable = plan_responsable(accion)
        session.add(SACPlanAccion(
            sac_id=sac.id,
            orden=accion.orden or accion.n or idx,
            desc=accion.desc,
            responsable=responsable,
            responsable_av=accion.responsable_av or accion.av or initials(responsable),
            fecha=accion.fecha,
            estado=accion.estado,
        ))
    add_history(session, sac.id, user.nombre, "registro la SAC en el sistema", "blue", "file-plus")
    session.commit()
    session.refresh(sac)
    return full_response(sac)


@router.put("/{sac_id}", response_model=SACResponse)
def update_sac(sac_id: str, payload: SACUpdate, session: Session = Depends(get_session), user: Usuario = Depends(get_current_user)):
    sac = session.get(SAC, sac_id)
    if not sac or not sac.activo:
        raise HTTPException(status_code=404, detail="SAC no encontrada.")
    old_estado = sac.estado
    old_responsable = sac.responsable
    old_implementacion = sac.implementacion
    old_timeline_step = sac.timeline_step
    changes = apply_update(sac, payload)
    if payload.plan_acciones is not None or payload.planAccion is not None:
        for existing in list(sac.plan_acciones):
            session.delete(existing)
        sac.plan_acciones = []
        session.flush()
        plan_items = payload.planAccion if payload.planAccion is not None else payload.plan_acciones or []
        plan_dates = []
        for idx, accion in enumerate(plan_items, start=1):
            responsable = plan_responsable(accion)
            if accion.fecha:
                plan_dates.append(accion.fecha)
            session.add(SACPlanAccion(
                sac_id=sac.id,
                orden=accion.orden or accion.n or idx,
                desc=accion.desc,
                responsable=responsable,
                responsable_av=accion.responsable_av or accion.av or initials(responsable),
                fecha=accion.fecha,
                estado=accion.estado,
            ))
        if plan_dates:
            sac.fecha_compromiso = max(plan_dates)
    if "estado" in changes or old_estado != sac.estado:
        add_history(session, sac.id, user.nombre, f"cambio el estado de {old_estado} a", "amber", "flag", sac.estado)
    if old_responsable != sac.responsable:
        add_history(session, sac.id, user.nombre, "reasigno la SAC a", "blue", "users", sac.responsable)
    if old_implementacion != sac.implementacion:
        add_history(session, sac.id, user.nombre, "actualizo la implementacion a", "green", "check", f"{sac.implementacion}%")
    if old_timeline_step != sac.timeline_step:
        label = "etapa " + str(sac.timeline_step)
        if 0 <= sac.timeline_step < 7:
            label = ["Deteccion", "Registro", "Analisis", "Plan de accion", "Implementacion", "Verificacion", "Cierre"][sac.timeline_step]
        add_history(session, sac.id, user.nombre, "actualizo el progreso a", "blue", "target", label)
    if not changes:
        add_history(session, sac.id, user.nombre, "actualizo la informacion de la SAC", "blue", "edit")
    session.add(sac)
    session.commit()
    session.refresh(sac)
    return full_response(sac)


@router.delete("/{sac_id}")
def delete_sac(sac_id: str, session: Session = Depends(get_session), user: Usuario = Depends(get_current_user)):
    if user.rol not in {"coordinador", "directora_calidad"}:
        raise HTTPException(status_code=403, detail="No tiene permisos para eliminar SAC.")
    sac = session.get(SAC, sac_id)
    if not sac or not sac.activo:
        raise HTTPException(status_code=404, detail="SAC no encontrada.")
    campus = sac.campus_iniciales
    year = sac.fecha_registro.year
    sac.activo = False
    sac.code = f"DEL-{sac.code}-{sac.id[:8]}"
    sac.codigo = f"DEL-{sac.codigo}-{sac.id[:8]}"
    sac.actualizado_en = utcnow()
    add_history(session, sac.id, user.nombre, "desactivo la SAC", "red", "x")
    session.add(sac)
    session.flush()
    renumber_active_sacs(session, campus, year)
    session.commit()
    return {"ok": True}

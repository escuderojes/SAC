from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from auth import get_current_user
from database import get_session
from models import SAC, SACHistorial, SACPlanAccion, Usuario, utcnow
from schemas import PlanAccionCreate, PlanAccionResponse, PlanAccionUpdate, initials

router = APIRouter(prefix="/api/sac/{sac_id}/plan", tags=["plan"])

COMPLETADAS = {"completada", "verificada", "cerrada"}


def recalc_implementacion(session: Session, sac_id: str) -> None:
    sac = session.get(SAC, sac_id)
    if not sac:
        return
    acciones = session.exec(select(SACPlanAccion).where(SACPlanAccion.sac_id == sac_id)).all()
    if not acciones:
        sac.implementacion = 0
    else:
        completas = sum(1 for a in acciones if a.estado in COMPLETADAS)
        sac.implementacion = round((completas / len(acciones)) * 100)
    sac.actualizado_en = utcnow()
    session.add(sac)


def add_log(session: Session, sac_id: str, user: Usuario, what: str, em: str = "") -> None:
    session.add(SACHistorial(sac_id=sac_id, who=user.nombre, what=what, em=em, icon="list-checks", kind="blue"))


def ensure_sac(session: Session, sac_id: str) -> SAC:
    sac = session.get(SAC, sac_id)
    if not sac or not sac.activo:
        raise HTTPException(status_code=404, detail="SAC no encontrada.")
    return sac


@router.get("", response_model=list[PlanAccionResponse])
def list_plan(sac_id: str, session: Session = Depends(get_session), _: Usuario = Depends(get_current_user)):
    ensure_sac(session, sac_id)
    return session.exec(select(SACPlanAccion).where(SACPlanAccion.sac_id == sac_id).order_by(SACPlanAccion.orden)).all()


@router.post("", response_model=PlanAccionResponse)
def create_plan_item(sac_id: str, payload: PlanAccionCreate, session: Session = Depends(get_session), user: Usuario = Depends(get_current_user)):
    ensure_sac(session, sac_id)
    max_orden = max([a.orden for a in session.exec(select(SACPlanAccion).where(SACPlanAccion.sac_id == sac_id)).all()] or [0])
    item = SACPlanAccion(
        sac_id=sac_id,
        orden=max_orden + 1,
        desc=payload.desc,
        responsable=payload.responsable,
        responsable_av=payload.responsable_av or payload.av or initials(payload.responsable),
        fecha=payload.fecha,
        estado=payload.estado,
    )
    session.add(item)
    session.flush()
    recalc_implementacion(session, sac_id)
    add_log(session, sac_id, user, "agrego una accion al plan", item.desc)
    session.commit()
    session.refresh(item)
    return item


@router.put("/reorder")
def reorder_plan(sac_id: str, ids: list[str], session: Session = Depends(get_session), user: Usuario = Depends(get_current_user)):
    ensure_sac(session, sac_id)
    for idx, action_id in enumerate(ids, start=1):
        item = session.get(SACPlanAccion, action_id)
        if item and item.sac_id == sac_id:
            item.orden = idx
            session.add(item)
    add_log(session, sac_id, user, "reordeno el plan de accion")
    session.commit()
    return {"ok": True}


@router.put("/{accion_id}", response_model=PlanAccionResponse)
def update_plan_item(sac_id: str, accion_id: str, payload: PlanAccionUpdate, session: Session = Depends(get_session), user: Usuario = Depends(get_current_user)):
    ensure_sac(session, sac_id)
    item = session.get(SACPlanAccion, accion_id)
    if not item or item.sac_id != sac_id:
        raise HTTPException(status_code=404, detail="Accion no encontrada.")
    old_estado = item.estado
    data = payload.model_dump(exclude_unset=True)
    if "av" in data and "responsable_av" not in data:
        data["responsable_av"] = data.pop("av")
    for key, value in data.items():
        if hasattr(item, key) and value is not None:
            setattr(item, key, value)
    if item.responsable and not item.responsable_av:
        item.responsable_av = initials(item.responsable)
    session.add(item)
    recalc_implementacion(session, sac_id)
    if old_estado != item.estado:
        add_log(session, sac_id, user, "cambio el estado de una accion a", item.estado)
    session.commit()
    session.refresh(item)
    return item


@router.delete("/{accion_id}")
def delete_plan_item(sac_id: str, accion_id: str, session: Session = Depends(get_session), user: Usuario = Depends(get_current_user)):
    ensure_sac(session, sac_id)
    item = session.get(SACPlanAccion, accion_id)
    if not item or item.sac_id != sac_id:
        raise HTTPException(status_code=404, detail="Accion no encontrada.")
    session.delete(item)
    session.flush()
    rows = session.exec(select(SACPlanAccion).where(SACPlanAccion.sac_id == sac_id).order_by(SACPlanAccion.orden)).all()
    for idx, row in enumerate(rows, start=1):
        row.orden = idx
        session.add(row)
    recalc_implementacion(session, sac_id)
    add_log(session, sac_id, user, "elimino una accion del plan", item.desc)
    session.commit()
    return {"ok": True}

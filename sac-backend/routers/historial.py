from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from auth import get_current_user
from database import get_session
from models import SAC, SACHistorial, Usuario
from schemas import HistorialResponse

router = APIRouter(prefix="/api/sac/{sac_id}/historial", tags=["historial"])


@router.get("", response_model=list[HistorialResponse])
def list_historial(sac_id: str, session: Session = Depends(get_session), _: Usuario = Depends(get_current_user)):
    sac = session.get(SAC, sac_id)
    if not sac or not sac.activo:
        raise HTTPException(status_code=404, detail="SAC no encontrada.")
    return session.exec(select(SACHistorial).where(SACHistorial.sac_id == sac_id).order_by(SACHistorial.created_at.desc())).all()

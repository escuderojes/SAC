from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import Session

from auth import get_current_user
from database import get_session
from models import SAC, Usuario
from services.word_export import build_docx

router = APIRouter(prefix="/api/sac", tags=["export"])


@router.get("/{sac_id}/export")
def export_sac(sac_id: str, session: Session = Depends(get_session), _: Usuario = Depends(get_current_user)):
    sac = session.get(SAC, sac_id)
    if not sac or not sac.activo:
        raise HTTPException(status_code=404, detail="SAC no encontrada.")
    buffer = build_docx(sac)
    filename = f"SAC-{sac.code}.docx"
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

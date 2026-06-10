from datetime import date, timedelta
from statistics import mean
from typing import Optional

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from database import get_session
from models import SAC
from schemas import StatsResponse

router = APIRouter(tags=["stats"])


def month_start(d: date) -> date:
    return date(d.year, d.month, 1)


def add_months(d: date, months: int) -> date:
    year = d.year + (d.month - 1 + months) // 12
    month = (d.month - 1 + months) % 12 + 1
    return date(year, month, 1)


def calc_stats(session: Session, campus_iniciales: Optional[str] = None) -> StatsResponse:
    today = date.today()
    stmt = select(SAC).where(SAC.activo == True)  # noqa: E712
    if campus_iniciales:
        stmt = stmt.where(SAC.campus_iniciales == campus_iniciales)
    sacs = session.exec(stmt).all()

    abiertas = sum(1 for s in sacs if s.estado != "cerrada")
    vencidas = sum(1 for s in sacs if s.estado != "cerrada" and s.fecha_compromiso and s.fecha_compromiso < today)
    current_month = month_start(today)
    next_month = add_months(current_month, 1)
    cerradas_mes = sum(1 for s in sacs if s.fecha_cierre and current_month <= s.fecha_cierre < next_month)

    six_months_ago = add_months(current_month, -6)
    close_durations = [
        (s.fecha_cierre - s.fecha_registro).days
        for s in sacs
        if s.fecha_cierre and s.fecha_registro and s.fecha_cierre >= six_months_ago
    ]
    tiempo_promedio = round(mean(close_durations)) if close_durations else 0

    months = [add_months(current_month, i) for i in range(-8, 1)]
    spark_abiertas = []
    spark_vencidas = []
    spark_cerradas = []
    spark_tiempo = []
    for m in months:
        m_next = add_months(m, 1)
        month_sacs = [s for s in sacs if s.fecha_registro < m_next]
        spark_abiertas.append(sum(1 for s in month_sacs if s.estado != "cerrada"))
        spark_vencidas.append(sum(1 for s in month_sacs if s.estado != "cerrada" and s.fecha_compromiso and s.fecha_compromiso < m_next))
        closed = [s for s in sacs if s.fecha_cierre and m <= s.fecha_cierre < m_next]
        spark_cerradas.append(len(closed))
        durations = [(s.fecha_cierre - s.fecha_registro).days for s in closed if s.fecha_registro]
        spark_tiempo.append(round(mean(durations)) if durations else (spark_tiempo[-1] if spark_tiempo else 0))

    return StatsResponse(
        abiertas=abiertas,
        vencidas=vencidas,
        cerradas_mes=cerradas_mes,
        tiempo_promedio_cierre=tiempo_promedio,
        spark_abiertas=spark_abiertas,
        spark_vencidas=spark_vencidas,
        spark_cerradas=spark_cerradas,
        spark_tiempo=spark_tiempo,
        abiertasSpark=spark_abiertas,
        vencidasSpark=spark_vencidas,
        cerradasSpark=spark_cerradas,
        tiempoSpark=spark_tiempo,
        cerradasMes=cerradas_mes,
        tiempoPromedioCierre=tiempo_promedio,
    )


@router.get("/api/stats", response_model=StatsResponse)
def get_stats(campus_iniciales: Optional[str] = None, session: Session = Depends(get_session)):
    return calc_stats(session, campus_iniciales)


@router.get("/api/sac/stats", response_model=StatsResponse)
def get_sac_stats(campus_iniciales: Optional[str] = None, session: Session = Depends(get_session)):
    return calc_stats(session, campus_iniciales)

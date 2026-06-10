from datetime import date, timedelta

from sqlmodel import Session, select

from auth import hash_password
from database import create_db_and_tables, engine
from models import Campus, SAC, SACHistorial, SACPlanAccion, Usuario
from routers.catalogos import CAMPUS
from routers.sac import FUENTE_ABBR
from schemas import initials


def d(days_delta: int) -> date:
    return date.today() + timedelta(days=days_delta)


USERS = [
    {"nombre": "M. Quispe Hurtado", "email": "mquispe@ucv.edu.pe", "rol": "coordinador", "campus": "LN"},
]

SACS = [
    {
        "code": "03-2026-LN", "prioridad": "alta", "proceso": "Servicios Academicos",
        "proceso_sgc": "Formacion Academica", "responsable": "M. Quispe Hurtado",
        "descripcion": "Registros academicos sin actualizacion oportuna en SIGA",
        "descripcion_sub": "Incumplimiento de plazo en 4 escuelas profesionales",
        "fuente": "Auditoria interna", "fecha_registro": d(-36), "fecha_compromiso": d(21),
        "estado": "ejecucion", "implementacion": 60, "eficacia": "pe",
        "nc": "Durante la auditoria interna se evidencio que cuatro escuelas profesionales no actualizaron registros academicos dentro del plazo establecido.",
    },
]

PLAN_BASE = [
    ("Capacitar al personal responsable del proceso", "M. Quispe Hurtado", "completada"),
    ("Definir control de seguimiento y alertas", "P. Cardenas Loyola", "proceso"),
    ("Actualizar procedimiento y matriz de responsabilidades", "L. Sanchez Albujar", "pendiente"),
]


def seed():
    create_db_and_tables()
    with Session(engine) as session:
        for item in CAMPUS:
            if not session.get(Campus, item["iniciales"]):
                session.add(Campus(**item))

        for user in USERS:
            exists = session.exec(select(Usuario).where(Usuario.email == user["email"])).first()
            if not exists:
                session.add(Usuario(**user, password_hash=hash_password("admin123")))

        session.commit()
        creator = session.exec(select(Usuario).where(Usuario.email == "mquispe@ucv.edu.pe")).first()

        for item in SACS:
            codigo = f"SAC-{item['code']}"
            exists = session.exec(select(SAC).where(SAC.codigo == codigo)).first()
            if exists:
                continue
            sac = SAC(
                codigo=codigo,
                code=item["code"],
                campus="UCV — Campus Lima Norte",
                campus_iniciales="LN",
                proceso=item["proceso"],
                proceso_abbr=initials(item["proceso"]),
                proceso_sgc=item["proceso_sgc"],
                norma="ISO 9001:2015",
                clausula="8.7.1 / 10.2",
                fuente=item["fuente"],
                fuente_abbr=FUENTE_ABBR.get(item["fuente"], ""),
                prioridad=item["prioridad"],
                responsable=item["responsable"],
                responsable_short=initials(item["responsable"]),
                originador="Coord. de Calidad - Auditoria Interna 2026-I",
                fecha_registro=item["fecha_registro"],
                fecha_compromiso=item["fecha_compromiso"],
                fecha_cierre=item.get("fecha_cierre"),
                estado=item["estado"],
                implementacion=item["implementacion"],
                eficacia=item["eficacia"],
                descripcion=item["descripcion"],
                descripcion_sub=item["descripcion_sub"],
                nc=item["nc"],
                accion_inmediata="No aplica",
                accion_inm_responsable="No aplica",
                accion_inm_fecha=None,
                analisis_causa="Analisis de causa raiz pendiente de ampliacion segun 5 Por que.",
                analisis_whys=[
                    {"n": 1, "txt": "Se detecta incumplimiento del requisito."},
                    {"n": 2, "txt": "El proceso no cuenta con control suficiente."},
                    {"n": 3, "txt": "La alerta o seguimiento no fue oportuno."},
                    {"n": 4, "txt": "El procedimiento requiere ajuste operativo."},
                    {"n": 5, "txt": "Causa raiz: control preventivo insuficiente.", "root": True},
                ],
                timeline_step=4,
                timeline_dates=["28/04", "04/05", "08/05", "12/05", "20/05", "", ""],
                verif_impl_por="L. Sanchez Albujar",
                verif_efic_por="L. Sanchez Albujar",
                creado_por=creator.id if creator else None,
            )
            session.add(sac)
            session.flush()
            for idx, (desc, responsable, estado) in enumerate(PLAN_BASE, start=1):
                session.add(SACPlanAccion(
                    sac_id=sac.id,
                    orden=idx,
                    desc=desc,
                    responsable=responsable,
                    responsable_av=initials(responsable),
                    fecha=item["fecha_registro"] + timedelta(days=idx * 7),
                    estado=estado,
                ))
            session.add(SACHistorial(sac_id=sac.id, who="Sistema SAC", what="registro la SAC en el sistema", icon="file-plus", kind="blue"))

        session.commit()
    print("Seed completado.")


if __name__ == "__main__":
    seed()

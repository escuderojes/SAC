from datetime import date, timedelta

from sqlmodel import Session, select

from auth import hash_password
from database import create_db_and_tables, engine
from models import Campus, SAC, SACHistorial, SACPlanAccion, Usuario
from models import AreaResponsable, Procedimiento, ProcesoSGC
from routers.catalogos import CAMPUS, PROCEDIMIENTOS, PROCESOS_SGC, load_areas_responsables_fallback
from routers.sac import FUENTE_ABBR
from schemas import initials


def d(days_delta: int) -> date:
    return date.today() + timedelta(days=days_delta)


USERS = [
    {"nombre": "Sara de los Milagros Navarro Coloma", "email": "snavarro@ucv.edu.pe", "rol": "directora_calidad", "campus": "LN"},
]

SACS = []
PLAN_BASE = []


def seed():
    create_db_and_tables()
    with Session(engine) as session:
        for item in CAMPUS:
            if not session.get(Campus, item["iniciales"]):
                session.add(Campus(**item))

        for item in load_areas_responsables_fallback():
            exists = session.exec(select(AreaResponsable).where(AreaResponsable.area == item["area"])).first()
            if not exists:
                session.add(AreaResponsable(
                    tipo=item.get("tipo", ""),
                    area=item.get("area", ""),
                    responsable=item.get("responsable", ""),
                    cargo=item.get("cargo", ""),
                    correo=item.get("correo", ""),
                    correo_area=item.get("correoArea") or item.get("correo_area", ""),
                ))

        for nombre in PROCESOS_SGC:
            exists = session.exec(select(ProcesoSGC).where(ProcesoSGC.nombre == nombre)).first()
            if not exists:
                session.add(ProcesoSGC(nombre=nombre))

        for codigo, nombre in PROCEDIMIENTOS:
            key = f"{codigo} {nombre}"
            exists = session.exec(select(Procedimiento).where(Procedimiento.codigo == codigo, Procedimiento.nombre == nombre)).first()
            if not exists:
                session.add(Procedimiento(codigo=codigo, nombre=nombre))

        for user in USERS:
            exists = session.exec(select(Usuario).where(Usuario.email == user["email"])).first()
            if not exists:
                legacy = session.exec(select(Usuario).where(Usuario.email == "mquispe@ucv.edu.pe")).first()
                if legacy:
                    legacy.nombre = user["nombre"]
                    legacy.email = user["email"]
                    legacy.rol = user["rol"]
                    legacy.campus = user["campus"]
                    legacy.password_hash = hash_password("admin123")
                    legacy.activo = True
                else:
                    session.add(Usuario(**user, password_hash=hash_password("admin123")))
            else:
                exists.nombre = user["nombre"]
                exists.rol = user["rol"]
                exists.campus = user["campus"]
                exists.password_hash = hash_password("admin123")
                exists.activo = True

        session.commit()
        creator = session.exec(select(Usuario).where(Usuario.email == "snavarro@ucv.edu.pe")).first()

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

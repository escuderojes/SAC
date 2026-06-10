import json
from pathlib import Path

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from database import get_session
from models import AreaResponsable, Procedimiento, ProcesoSGC

router = APIRouter(prefix="/api/catalogos", tags=["catalogos"])

RESPONSABLES = [
    "M. Quispe Hurtado",
    "L. Sanchez Albujar",
    "C. Vega Salazar",
    "A. Ramirez Tovar",
    "D. Flores Aguilar",
    "J. Huaman Cerron",
    "L. Bernal Ortiz",
    "R. Calderon Pinto",
    "S. Olivares Mendoza",
    "P. Cardenas Loyola",
]

CAMPUS = [
    {"iniciales": "LN", "nombre": "UCV — Campus Lima Norte"},
    {"iniciales": "LE", "nombre": "UCV — Campus Lima Este"},
    {"iniciales": "LA", "nombre": "UCV — Campus Lima Ate Vitarte"},
    {"iniciales": "TRU", "nombre": "UCV — Campus Trujillo"},
    {"iniciales": "PIU", "nombre": "UCV — Campus Piura"},
    {"iniciales": "CHY", "nombre": "UCV — Campus Chiclayo"},
    {"iniciales": "CHM", "nombre": "UCV — Campus Chimbote"},
    {"iniciales": "HUA", "nombre": "UCV — Campus Huaraz"},
    {"iniciales": "CAL", "nombre": "UCV — Campus Callao"},
    {"iniciales": "TAR", "nombre": "UCV — Campus Tarapoto"},
    {"iniciales": "MOY", "nombre": "UCV — Campus Moyobamba"},
]

PROCESOS_SGC = [
    "ADMINISTRACION EJECUTIVA",
    "PLANIFICACION",
    "GESTION DE LA CALIDAD",
    "INTERNACIONALIZACION",
    "ENSEÑANZA - APRENDIZAJE",
    "INVESTIGACION",
    "RESPONSABILIDAD SOCIAL UNIVERSITARIA",
    "ADMINISTRACION DE TIC",
    "ADMINISTRACION DE PERSONAL",
    "ADMINISTRACION DE RECURSOS MATERIALES E INFRAESTRUCTURA",
    "BIENESTAR UNIVERSITARIO",
    "ADMINISTRACION FINANCIERA",
    "SEGURIDAD Y SALUD EN EL TRABAJO",
]

AREAS = [
    "Servicios Academicos", "Coordinacion Academica", "Direccion de Escuela", "Bienestar Universitario",
    "Biblioteca", "Mantenimiento", "Tesoreria", "Tecnologias de Informacion", "Recursos Humanos",
    "Admision", "Investigacion",
]

FUENTES = [
    "Auditoria interna", "Auditoria externa", "Evaluacion plan estrategico", "Salidas no conformes",
    "Revision por direccion", "Satisfaccion del cliente", "Medicion y control", "Quejas repetitivas",
    "Otras fuentes",
]

AREAS_RESPONSABLES = [
    {"tipo": "programa", "area": "ADMINISTRACION DE EMPRESAS", "responsable": "Carlos Alberto Delgado Cespedes", "cargo": "Coordinador", "correo": "cdelgadoc@ucv.edu.pe", "correo_area": "epadministracion.ln@ucv.edu.pe"},
    {"tipo": "programa", "area": "ARTE & DISEÑO GRAFICO EMPRESARIAL", "responsable": "Karla Robalino Sanchez", "cargo": "Coordinador", "correo": "krobalino@ucv.edu.pe", "correo_area": "eparteydisenografico.ln@ucv.edu.pe"},
    {"tipo": "programa", "area": "INGENIERIA DE SISTEMAS", "responsable": "Jhonatan Brayan Monzon Sanchez", "cargo": "Coordinador", "correo": "jmonzon@ucv.edu.pe", "correo_area": "epingenieriasistemas.ln@ucv.edu.pe"},
    {"tipo": "administrativo", "area": "GESTION DE LA CALIDAD", "responsable": "Sara de los Milagros Navarro Coloma", "cargo": "Directora", "correo": "snavarro@ucv.edu.pe"},
    {"tipo": "administrativo", "area": "INFRAESTRUCTURA Y SERVICIOS GENERAL", "responsable": "Miguel Angel Parodi Palacios", "cargo": "Jefe", "correo": "mparodi@ucv.edu.pe"},
]

CATALOG_DIR = Path(__file__).resolve().parents[1] / "catalogs"


def load_areas_responsables_fallback():
    path = CATALOG_DIR / "areas_responsables.json"
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return AREAS_RESPONSABLES

PROCEDIMIENTOS = [
    ("PS-PR-01.05", "ATENCION A FAMILIAS"),
    ("PD-PR-04.01", "DIFUSION Y COMUNICACIONES"),
    ("PD-PR-04.08", "GESTION DE ESTUDIOS CUANTITATIVOS"),
    ("PD-PR-04.05", "ATENCION DE DERECHOS ARCO"),
    ("PD-PR-04.08", "PUBLICACION Y ACTUALIZACION DEL PORTAL DE TRANSPARENCIA"),
    ("PD-PR-04.04", "GESTION DE LA INFORMACION CORPORATIVA EN LA INTERNET Y REDES SOCIALES"),
    ("PD-PR-01.01", "FORMULACION, ACTUALIZACION Y EVALUACION DE PLANES ESTRATEGICOS"),
    ("PD-PR-01.02", "FORMULACION Y ACTUALIZACION DEL PLAN OPERATIVO, PLAN DE INVERSION Y PRESUPUESTO ANUAL"),
    ("PD-PR-01.03", "EVALUACION DE PLANES OPERATIVOS"),
    ("PD-PR-01.04", "ELABORACION Y ACTUALIZACION DE ORGANIGRAMAS"),
    ("PD-PR-02.01", "CONTROL DE INFORMACION DOCUMENTADA"),
    ("PD-PR-02.02", "CONTROL DE LAS SALIDAS NO CONFORMES"),
    ("PD-PR-02.03", "AUDITORIA INTERNA"),
    ("PD-PR-02.04", "AUTOEVALUACION"),
    ("PD-PR-02.05", "ACCIONES CORRECTIVAS"),
    ("PD-PR-02.06", "GESTION DE RECLAMOS"),
    ("PD-PR-02.08", "ELABORACION, EJECUCION Y EVALUACION DE PLANES DE MEJORA"),
    ("PD-PR-02.09", "IDENTIFICACION Y ACCIONES DE LOS RIESGOS Y OPORTUNIDADES"),
    ("PD-PR-02.07", "PARTICIPACION DE LOS GRUPOS DE INTERES"),
    ("PD-PR-02.10", "GESTION DEL CAMBIO"),
    ("PD-PR-03.03", "ELABORACION, APROBACION Y RENOVACION DE CONVENIOS"),
    ("PD-PR-03.04", "GESTION DE MOVILIDAD DOCENTE Y ADMINISTRATIVOS"),
    ("PD-PR-03.05", "GESTION DE MOVILIDAD ACADEMICA ESTUDIANTIL"),
    ("PP-PR-01.01", "EVALUACION Y ACTUALIZACION DEL CURRICULO"),
    ("PP-PR-01.02", "PROGRAMACION ACADEMICA"),
    ("PP-PR-01.03", "EVALUACION DEL PERFIL DEL INGRESANTE"),
    ("PP-PR-01.04", "PROGRAMACION CURRICULAR"),
    ("PP-PR-01.05", "EVALUACION DEL PERFIL DEL EGRESADO"),
    ("PP-PR-01.06", "SEGUIMIENTO DEL EGRESADO"),
    ("PP-PR-01.07", "ADMISION"),
    ("PP-PR-01.08", "MATRICULA"),
    ("PP-PR-01.10", "GRADUACION"),
    ("PP-PR-01.11", "TITULACION"),
    ("PP-PR-01.12", "ELABORACION DE UN NUEVO CURRICULO"),
    ("PP-PR-01.15", "COLOCACION DE ESTUDIANTES Y EGRESADOS"),
    ("PP-PR-01.16", "EVALUACION DEL DESEMPEÑO DEL PERSONAL DOCENTE"),
    ("PP-PR-01.17", "CIRCULACION DE LA COLECCION BIBLIOGRAFICA"),
    ("PP-PR-01.18", "DESARROLLO DE LA COLECCION BIBLIOGRAFICA"),
    ("PP-PR-01.19", "CAPACITACION DEL PERSONAL DOCENTE"),
    ("PP-PR-01.20", "ADMINISTRACION DE PROYECTOS DE EXTENSION UNIVERSITARIA"),
    ("PP-PR-01.21", "RENOVACION DEL PERSONAL DOCENTE CONTRATADO"),
    ("PP-PR-02.01", "INVESTIGACION FORMATIVA"),
    ("PP-PR-02.02", "INVESTIGACION FIN DE PROGRAMA"),
    ("PP-PR-02.06", "PROYECTOS DE GRUPOS DE INVESTIGACION"),
    ("PP-PR-02.04", "PROPIEDAD INTELECTUAL"),
    ("PP-PR-03.02", "ADMINISTRACION DE PROYECTOS DE RESPONSABILIDAD SOCIAL UNIVERSITARIA"),
    ("PS-PR-04.02", "ATENCION DE USUARIO DE LA INFRAESTRUCTURA Y SERVICIOS INFORMATICOS"),
    ("PS-PR-03.01", "SELECCION E INDUCCION DEL PERSONAL DOCENTE"),
    ("PS-PR-03.03", "RECLUTAMIENTO Y SELECCION DEL PERSONAL ADMINISTRATIVO"),
    ("PS-PR-03.04", "EVALUACION POR COMPETENCIAS DEL PERSONAL ADMINISTRATIVO"),
    ("PS-PR-03.05", "CAPACITACION DEL PERSONAL ADMINISTRATIVO"),
    ("PS-PR-06.01", "GESTION DE COMPRAS"),
    ("PS-PR-06.03", "ADMINISTRACION DE AMBIENTES"),
    ("PS-PR-06.04", "MANTENIMIENTO Y REPARACION"),
    ("PS-PR-06.05", "INFRAESTRUCTURA Y EQUIPAMIENTO"),
    ("PS-PR-06.01", "REGISTRO DE MOVIMIENTO DE BIENES"),
    ("PS-PR-06.01", "BAJA DE ACTIVO FIJO"),
    ("PS-PR-01.01", "ASIGNACION DE CATEGORIA DE PENSIONES A INGRESANTES"),
    ("PS-PR-01.02", "ATENCION PRIMARIA EN SALUD"),
    ("PS-PR-01.08", "ATENCION PSICOLOGICA Y PSICOPEDAGOGICA"),
    ("PS-PR-01.11", "PLANIFICACION, DESARROLLO Y EVALUACION DEL PD Y ACTV. ESPARC."),
    ("PS-PR-01.12", "ACOMPAÑAMIENTO A ESTUDIANTES"),
    ("PS-PF-05.01", "DECLARACION Y PAGO DE IMPUESTOS"),
    ("PS-PF-05.02", "REGISTRO Y PROCESAMIENTO DE LA INFORMACION CONTABLE"),
    ("PS-PF-05.03", "REVISION Y REGISTRO DE COMPROBANTES DE PAGO"),
    ("PS-PF-05.04", "SOLICITUD Y LIQUIDACION DE VIATICOS"),
    ("PS-PF-05.05", "PAGO DE PROVEEDORES DE BIENES Y SERVICIOS"),
    ("PS-PF-05.06", "APERTURA, ADMINISTRACION Y CIERRE DEL FONDO FIJO"),
    ("PS-PF-05.07", "PAGO DE PRESTAMOS BANCARIOS - TESORERIA"),
    ("PS-PF-05.08", "LEASING"),
    ("PS-PF-05.10", "NOMINA DE REMUNERACIONES - GTH"),
    ("PS-PF-05.11", "PRESTAMOS Y ADELANTOS A COLABORADORES"),
    ("PS-PF-05.12", "LIQUIDACION DE BENEFICIOS SOCIALES"),
    ("PS-PF-05.13", "RECAUDACION DE INGRESOS"),
    ("PS-PF-05.14", "SUBVENCION Y PLANES DE SOSTENIBILIDAD FINANCIERA DE FILIALES DEFICITARIAS"),
    ("PS-PF-05.15", "ASIGNACION DE GASTOS DE ALTA DIRECCION"),
    ("PS-PF-05.16", "PAGO DE DIVIDENDOS"),
    ("PS-PF-05.17", "INVERSIONES"),
    ("PS-PF-05.18", "INDAGACION MERCADO, SELECCION PROVEEDOR"),
    ("PS-PF-05.19", "ADJUDICACION DE ORDEN DE COMPRA"),
    ("PS-PF-05.20", "ADQUISICION DE BIENES Y SERVICIOS VIRTUALES"),
    ("PS-PF-05.21", "GESTION DE ALMACENES E INVENTARIOS"),
    ("PS-PF-05.22", "RECUPERACION DE SUBSIDIOS"),
    ("PS-PR-07.01", "CONTROL DE INGRESO Y TRABAJOS DE TERCEROS"),
    ("PS-PR-07.02", "ELABORACION DE MATRIZ IPERC"),
    ("PS-PR-07.03", "TRABAJO DE ALTO RIESGO"),
    ("PS-PR-07.04", "INVESTIGACION DE INCIDENTES PELIGROSOS Y ACCIDENTES"),
    ("PS-PR-07.05", "ENTREGA Y USO DE EPP"),
    ("PS-PR-07.06", "IDENTIFICACION DE REQUISITOS LEGALES Y OTROS REQUISITOS"),
]


@router.get("/responsables")
def responsables(session: Session = Depends(get_session)):
    rows = session.exec(select(AreaResponsable).where(AreaResponsable.activo == True).order_by(AreaResponsable.responsable)).all()  # noqa: E712
    if rows:
        return sorted({row.responsable for row in rows})
    return RESPONSABLES


@router.get("/campus")
def campus():
    return CAMPUS


@router.get("/procesos-sgc")
def procesos_sgc(session: Session = Depends(get_session)):
    rows = session.exec(select(ProcesoSGC).where(ProcesoSGC.activo == True).order_by(ProcesoSGC.nombre)).all()  # noqa: E712
    return [row.nombre for row in rows] or PROCESOS_SGC


@router.get("/areas")
def areas(session: Session = Depends(get_session)):
    rows = session.exec(select(AreaResponsable).where(AreaResponsable.activo == True).order_by(AreaResponsable.area)).all()  # noqa: E712
    return [row.area for row in rows] or AREAS


@router.get("/fuentes")
def fuentes():
    return FUENTES


@router.get("/areas-responsables")
def areas_responsables(session: Session = Depends(get_session)):
    rows = session.exec(select(AreaResponsable).where(AreaResponsable.activo == True).order_by(AreaResponsable.area)).all()  # noqa: E712
    if rows:
        return [row.model_dump() for row in rows]
    return load_areas_responsables_fallback()


@router.get("/procedimientos")
def procedimientos(session: Session = Depends(get_session)):
    rows = session.exec(select(Procedimiento).where(Procedimiento.activo == True).order_by(Procedimiento.codigo, Procedimiento.nombre)).all()  # noqa: E712
    if rows:
        return [row.model_dump() for row in rows]
    return [{"codigo": codigo, "nombre": nombre, "label": f"{codigo} {nombre}"} for codigo, nombre in PROCEDIMIENTOS]

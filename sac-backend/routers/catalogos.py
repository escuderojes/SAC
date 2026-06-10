from fastapi import APIRouter

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
    "Planificacion", "Internacionalizacion", "Responsabilidad Social Universitaria y Bienestar Universitario",
    "Bienestar Universitario", "Investigacion", "Formacion Academica", "Gestion Docente",
    "Admision", "Tesoreria", "Biblioteca", "Tecnologias de Informacion", "Recursos Humanos",
    "Mantenimiento", "Servicios Academicos",
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


@router.get("/responsables")
def responsables():
    return RESPONSABLES


@router.get("/campus")
def campus():
    return CAMPUS


@router.get("/procesos-sgc")
def procesos_sgc():
    return PROCESOS_SGC


@router.get("/areas")
def areas():
    return AREAS


@router.get("/fuentes")
def fuentes():
    return FUENTES

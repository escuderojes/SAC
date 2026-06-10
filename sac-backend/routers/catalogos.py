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

AREAS_RESPONSABLES = [
    {"tipo": "programa", "area": "ADMINISTRACION DE EMPRESAS", "responsable": "Carlos Alberto Delgado Cespedes", "cargo": "Coordinador", "correo": "cdelgadoc@ucv.edu.pe", "correo_area": "epadministracion.ln@ucv.edu.pe"},
    {"tipo": "programa", "area": "ARTE & DISEÑO GRAFICO EMPRESARIAL", "responsable": "Karla Robalino Sanchez", "cargo": "Coordinador", "correo": "krobalino@ucv.edu.pe", "correo_area": "eparteydisenografico.ln@ucv.edu.pe"},
    {"tipo": "programa", "area": "INGENIERIA DE SISTEMAS", "responsable": "Jhonatan Brayan Monzon Sanchez", "cargo": "Coordinador", "correo": "jmonzon@ucv.edu.pe", "correo_area": "epingenieriasistemas.ln@ucv.edu.pe"},
    {"tipo": "administrativo", "area": "GESTION DE LA CALIDAD", "responsable": "Sara de los Milagros Navarro Coloma", "cargo": "Directora", "correo": "snavarro@ucv.edu.pe"},
    {"tipo": "administrativo", "area": "INFRAESTRUCTURA Y SERVICIOS GENERAL", "responsable": "Miguel Angel Parodi Palacios", "cargo": "Jefe", "correo": "mparodi@ucv.edu.pe"},
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


@router.get("/areas-responsables")
def areas_responsables():
    return AREAS_RESPONSABLES

/* Catalogs and static UI reference data */

const ESTADOS = [
  { id: 'todas', label: 'Todas' },
  { id: 'pendiente', label: 'Pendiente', cls: 'pendiente' },
  { id: 'analisis', label: 'En analisis', cls: 'analisis' },
  { id: 'ejecucion', label: 'En ejecucion', cls: 'ejecucion' },
  { id: 'verificacion', label: 'En verificacion', cls: 'verificacion' },
  { id: 'cerrada', label: 'Cerrada', cls: 'cerrada' },
  { id: 'noeficaz', label: 'No eficaz', cls: 'noeficaz' },
  { id: 'vencida', label: 'Vencida', cls: 'vencida' },
];

const FUENTES = [
  'Auditoria interna',
  'Auditoria externa',
  'Quejas repetitivas',
  'Plan estrategico',
  'Satisfaccion del cliente',
  'Medicion y control',
  'Otras fuentes',
];

const TIMELINE_STEPS = [
  { id: 'deteccion', label: 'Deteccion', icon: 'eye' },
  { id: 'registro', label: 'Registro', icon: 'file-plus' },
  { id: 'analisis', label: 'Analisis', icon: 'tree' },
  { id: 'plan', label: 'Plan de accion', icon: 'list-checks' },
  { id: 'implem', label: 'Implementacion', icon: 'cog' },
  { id: 'verif', label: 'Verificacion', icon: 'shield-check' },
  { id: 'cierre', label: 'Cierre', icon: 'check' },
];

const PLAN_ACCION = [];

const ACTIVITY = [];

const WHYS = [
  { n: 'Por que 1', txt: 'Registre el primer nivel de analisis de causa.' },
  { n: 'Por que 2', txt: 'Registre el segundo nivel de analisis de causa.' },
  { n: 'Por que 3', txt: 'Registre el tercer nivel de analisis de causa.' },
  { n: 'Por que 4', txt: 'Registre el cuarto nivel de analisis de causa.' },
  { n: 'Causa raiz', txt: 'Documente la causa raiz validada.', root: true },
];

window.ESTADOS = ESTADOS;
window.FUENTES = FUENTES;
window.TIMELINE_STEPS = TIMELINE_STEPS;
window.PLAN_ACCION = PLAN_ACCION;
window.ACTIVITY = ACTIVITY;
window.WHYS = WHYS;

window.AREAS_LIST = [
  'Servicios Academicos',
  'Coordinacion Academica',
  'Direccion de Escuela',
  'Bienestar Universitario',
  'Biblioteca',
  'Mantenimiento',
  'Tesoreria',
  'Tecnologias de Informacion',
  'Recursos Humanos',
  'Admision',
  'Investigacion',
];
window.PROCESOS_SGC_LIST = [
  'ADMINISTRACION EJECUTIVA',
  'PLANIFICACION',
  'GESTION DE LA CALIDAD',
  'INTERNACIONALIZACION',
  'ENSEÑANZA - APRENDIZAJE',
  'INVESTIGACION',
  'RESPONSABILIDAD SOCIAL UNIVERSITARIA',
  'ADMINISTRACION DE TIC',
  'ADMINISTRACION DE PERSONAL',
  'ADMINISTRACION DE RECURSOS MATERIALES E INFRAESTRUCTURA',
  'BIENESTAR UNIVERSITARIO',
  'ADMINISTRACION FINANCIERA',
  'SEGURIDAD Y SALUD EN EL TRABAJO',
];
window.FUENTES_LIST = [
  'Auditoria interna',
  'Auditoria externa',
  'Evaluacion plan estrategico',
  'Salidas no conformes',
  'Revision por direccion',
  'Satisfaccion del cliente',
  'Medicion y control',
  'Quejas repetitivas',
  'Otras fuentes',
];
window.RESPONSABLES_LIST = [
  'M. Quispe Hurtado',
  'L. Sanchez Albujar',
  'C. Vega Salazar',
  'A. Ramirez Tovar',
  'D. Flores Aguilar',
  'J. Huaman Cerron',
  'L. Bernal Ortiz',
  'R. Calderon Pinto',
  'S. Olivares Mendoza',
  'P. Cardenas Loyola',
];
window.ESTADOS_LIST = [
  { value: 'pendiente',     label: 'Pendiente' },
  { value: 'analisis',      label: 'En analisis' },
  { value: 'ejecucion',     label: 'En ejecucion' },
  { value: 'verificacion',  label: 'En verificacion' },
  { value: 'cerrada',       label: 'Cerrada' },
  { value: 'noeficaz',      label: 'No eficaz' },
  { value: 'vencida',       label: 'Vencida' },
];
window.PRIORIDADES_LIST = [
  { value: 'alta',  label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja',  label: 'Baja' },
];
window.PLAN_ESTADOS_LIST = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'ejecucion', label: 'En ejecucion' },
  { value: 'cerrada',   label: 'Completada' },
];

window.AREAS_RESPONSABLES = [
  { tipo: 'programa', area: 'ADMINISTRACION DE EMPRESAS', responsable: 'Carlos Alberto Delgado Cespedes', cargo: 'Coordinador', correo: 'cdelgadoc@ucv.edu.pe', correoArea: 'epadministracion.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'ADMINISTRACION EN TURISMO Y HOTELERIA', responsable: 'Veronica Zevallos Gallardo', cargo: 'Coordinadora', correo: 'zzevallos@ucv.edu.pe', correoArea: 'epturismoyhoteleria.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'ADMINISTRACION Y MARKETING', responsable: 'Carmen Patricia Tello Aguilar', cargo: 'Coordinadora', correo: 'ctello@ucv.edu.pe', correoArea: 'epmarketing.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'ADMINISTRACION Y NEGOCIOS INTERNACIONALES', responsable: 'Jenny Yessica Zarate Gavidia', cargo: 'Coordinadora', correo: 'yzarate1@ucv.edu.pe', correoArea: 'epnegociosinternacionales.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'ARQUITECTURA', responsable: 'Ricardo Javier Ugarte Chamorro', cargo: 'Coordinador', correo: 'rugarte@ucv.edu.pe', correoArea: 'eparquitectura.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'ARTE & DISEÑO GRAFICO EMPRESARIAL', responsable: 'Karla Robalino Sanchez', cargo: 'Coordinador', correo: 'krobalino@ucv.edu.pe', correoArea: 'eparteydisenografico.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'CIENCIAS DE LA COMUNICACION', responsable: 'Giuliana Giselle Ramos Palacios', cargo: 'Coordinadora', correo: 'gramospa@ucv.edu.pe', correoArea: 'epcomunicacion.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'CIENCIAS DEL DEPORTE', responsable: 'Marco Antonio Morales Bedoya', cargo: 'Coordinador', correo: 'mmoralesbe@ucv.edu.pe', correoArea: 'ep.cdeporte.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'CONTABILIDAD', responsable: 'Edward Giovani Baluarte Salvatier', cargo: 'Coordinador', correo: 'ebaluartes@ucv.edu.pe', correoArea: 'epcontabilidad.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'DERECHO', responsable: 'Franklin Leandro Herrera', cargo: 'Coordinador', correo: 'fleandrohe@ucv.edu.pe', correoArea: 'epderecho.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'ECONOMIA Y FINANZAS', responsable: 'Raquel Noemi Godoy Cedeño', cargo: 'Directora', correo: 'RGODOY@ucv.edu.pe', correoArea: 'epeconomia.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'EDUCACION EN IDIOMAS - INGLES', responsable: 'Rossana Delia Mezarina Castañeda', cargo: 'Coordinadora', correo: 'rmezarina@ucv.edu.pe', correoArea: 'eptraduccion.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'EDUCACION FISICA Y PSICOMOTRICIDAD', responsable: 'Marco Antonio Morales Bedoya', cargo: 'Coordinador', correo: 'mmoralesbe@ucv.edu.pe', correoArea: 'ep.cdeporte.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'EDUCACION INICIAL', responsable: 'Ana Jackeline Medina Arbi', cargo: 'Coordinadora', correo: 'amedinaa@ucv.edu.pe', correoArea: 'epeducacioninicial.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'EDUCACION PRIMARIA', responsable: 'Milagros Erazo Moreno', cargo: 'Coordinadora', correo: 'eerazom@ucv.edu.pe', correoArea: 'epeducacionprimaria.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'ENFERMERIA', responsable: 'Zora Maria de los Angeles Riojas Yance', cargo: 'Coordinador', correo: 'zriojasy@ucv.edu.pe', correoArea: 'epenfermeria.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'ESTOMATOLOGIA', responsable: 'Eric Dario Acuña Navarro', cargo: 'Coordinador', correo: 'eacunan@ucv.edu.pe', correoArea: 'ep.estomatologia.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'INGENIERIA AMBIENTAL', responsable: 'Veronica Tello Mendivil', cargo: 'Coordinadora', correo: 'vtellom@ucv.edu.pe', correoArea: 'epambiental.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'INGENIERIA CIVIL', responsable: 'Doris Lina Huaman Baldeon', cargo: 'Coordinadora', correo: 'dhuaman@ucv.edu.pe', correoArea: 'epingenieriacivil.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'INGENIERIA DE CIBERSEGURIDAD', responsable: 'Jhonatan Brayan Monzon Sanchez', cargo: 'Coordinador', correo: 'jmonzon@ucv.edu.pe', correoArea: 'epingenieriasistemas.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'INGENIERIA DE SISTEMAS', responsable: 'Jhonatan Brayan Monzon Sanchez', cargo: 'Coordinador', correo: 'jmonzon@ucv.edu.pe', correoArea: 'epingenieriasistemas.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'INGENIERIA EMPRESARIAL', responsable: 'Jorge Malpartida Gutierrez', cargo: 'Coordinador', correo: 'jmalpartida@ucv.edu.pe', correoArea: 'epingenieriaindustrial.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'INGENIERIA INDUSTRIAL', responsable: 'Jorge Malpartida Gutierrez', cargo: 'Coordinador', correo: 'jmalpartida@ucv.edu.pe', correoArea: 'epingenieriaindustrial.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'INGENIERIA MECANICA ELECTRICA', responsable: 'Boris Zevallos Herrera', cargo: 'Coordinador', correo: 'bzevalloshe@ucv.edu.pe', correoArea: 'ep.imecanica.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'MEDICINA', responsable: 'Fernando Gregorio Torres Salazar', cargo: 'Coordinador', correo: 'ftorress@ucv.edu.pe', correoArea: 'ep.medicina.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'NUTRICION', responsable: 'Maria del Carmen Baras Luna', cargo: 'Coordinadora', correo: 'mbarasl@ucv.edu.pe', correoArea: 'ep.nutricion.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'PSICOLOGIA', responsable: 'Erika Roxana Estrada Alomia', cargo: 'Coordinadora', correo: 'eestradaa2@ucv.edu.pe', correoArea: 'eppsicologia.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'TECNOLOGIA MEDICA EN LABORATORIO CLINICO Y ANATOMIA PATOLOGICA', responsable: 'Victor Raul Huaman Cardenas', cargo: 'Coordinador', correo: 'vhuamanca@ucv.edu.pe', correoArea: 'ep.tecmedica.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'TECNOLOGIA MEDICA EN TERAPIA FISICA Y REHABILITACION', responsable: 'Victor Raul Huaman Cardenas', cargo: 'Coordinador', correo: 'vhuamanca@ucv.edu.pe', correoArea: 'ep.tecmedica.ln@ucv.edu.pe' },
  { tipo: 'programa', area: 'TRADUCCION E INTERPRETACION', responsable: 'Rossana Delia Mezarina Castañeda', cargo: 'Coordinadora', correo: 'rmezarina@ucv.edu.pe', correoArea: 'eptraduccion.ln@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'ADMISION Y PROMOCION', responsable: 'Consuelo Cervantes Ruiz', cargo: 'Jefa', correo: 'ccervantesr@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'CAP', responsable: 'Eliana Maricely Pena Cisneros', cargo: 'Responsable', correo: 'epena@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'CENTRO DE INFORMACION', responsable: 'Carmen Pizarro Feliciano', cargo: 'Jefa', correo: 'cpizarrof@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'CID', responsable: 'Estela Pillichody Balzola', cargo: 'Responsable', correo: 'epillichodyba@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'CIS', responsable: 'Maria Rosa Quiroz Alcalde', cargo: 'Responsable', correo: 'mquiroz@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'COMUNICACIONES', responsable: 'Renato Ronquillo Amaya', cargo: 'Coordinador', correo: 'rronquilloa@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'CONSULTORIO MEDICO', responsable: 'Jose Deza', cargo: 'Coordinador', correo: 'JDEZA@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'CONSULTORIO PSICOLOGICO', responsable: 'Jose Deza', cargo: 'Coordinador', correo: 'JDEZA@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'CULTURA ESPARCIMIENTO Y DEPORTE', responsable: 'Cielo Abregu', cargo: 'Responsable', correo: 'cabregu@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'FINANZAS DEL ALUMNO', responsable: 'Amhi Miquel Lujan', cargo: 'Responsable', correo: 'amiquell@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'GESTION DE LA CALIDAD', responsable: 'Sara de los Milagros Navarro Coloma', cargo: 'Directora', correo: 'snavarro@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'GESTION DEL TALENTO HUMANO', responsable: 'Milka Noriega Aguilar', cargo: 'Coordinadora', correo: 'mnoriega@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'INFRAESTRUCTURA Y SERVICIOS GENERAL', responsable: 'Miguel Angel Parodi Palacios', cargo: 'Jefe', correo: 'mparodi@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'ASESORIA LEGAL', responsable: 'Sonia Uculmana', cargo: 'Responsable', correo: 'suculmana@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'MARKETING', responsable: 'Alexandra Zapata Araujo', cargo: 'Responsable', correo: 'rzapataar@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'DIRECCION DE INVESTIGACION', responsable: 'Juan Francisco Salazar Llanos', cargo: 'Director', correo: 'jsalazar@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'OFICINA DE RELACIONES INTERNACIONALES Y COOPERACION', responsable: 'Jacqueline Anampa Toledo', cargo: 'Coordinadora', correo: 'janampa@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'PATRIMONIO', responsable: 'Cesar Cueva Castillo', cargo: 'Responsable', correo: 'ccuevac@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'PLANIFICACION', responsable: 'Aldo Ramirez Briones', cargo: 'Responsable', correo: 'aramirez@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'REGISTROS ACADEMICOS', responsable: 'Dra. Karina Chu Salazar', cargo: 'Responsable', correo: 'kchus@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'RESPONSABILIDAD SOCIAL UNIVERSITARIA', responsable: 'Edward Muñoz Ucanan', cargo: 'Coordinador', correo: 'emunozu@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'SEGUIMIENTO AL EGRESADO Y EMPLEABILIDAD', responsable: 'Leyla Dueñas Custodio', cargo: 'Coordinadora', correo: 'lduenas@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'SEGURIDAD', responsable: 'Miguel Hermoza Romero', cargo: 'Responsable', correo: 'mhermozar@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'SOPORTE TECNICO', responsable: 'Michael Iparraguirre Villanueva', cargo: 'Responsable', correo: 'miparraguirre@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'SSOMA', responsable: 'Victor Alberto Melo Agüero', cargo: 'Coordinador', correo: 'gcarbajal@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'APOYO A LA COMUNIDAD UNIVERSITARIA Y ACOMPAÑAMIENTO AL ESTUDIANTE', responsable: 'Vanessa Cochachi Rojas', cargo: 'Coordinador', correo: 'vcochachi@ucv.edu.pe' },
  { tipo: 'administrativo', area: 'TRANSPORTE', responsable: 'Jackeline Abanto', cargo: 'Responsable', correo: 'jabantop@ucv.edu.pe' },
];

window.AREAS_LIST = window.AREAS_RESPONSABLES.map(item => item.area);
window.RESPONSABLES_LIST = Array.from(new Set(window.AREAS_RESPONSABLES.map(item => item.responsable)));
window.findAreaResponsable = (area) => window.AREAS_RESPONSABLES.find(item => item.area === area);
window.areaAbbr = (area) => {
  const text = String(area || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
  if (text.includes('INVESTIG')) return 'INV';
  if (['CAP', 'CID', 'CIS', 'SSOMA'].includes(text)) return text;
  const skip = new Set(['DE', 'DEL', 'LA', 'LAS', 'LOS', 'Y', 'EN', 'AREA', 'UNIDAD']);
  const generic = new Set(['DIRECCION', 'OFICINA', 'PROGRAMA']);
  const words = text.replace(/&/g, ' ').replace(/-/g, ' ').split(/\s+/).filter(Boolean);
  const keywords = words.filter(w => !skip.has(w) && !generic.has(w));
  if (keywords.length === 1) return keywords[0].slice(0, 3);
  const initials = keywords.map(w => w[0]).join('').slice(0, 5);
  return initials || 'AREA';
};

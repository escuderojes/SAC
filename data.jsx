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

const ACTIVITY = [
  { kind: 'blue', icon: 'file-plus', who: 'Sistema SAC', when: 'Actividad reciente', what: 'registro creado o actualizado desde el backend' },
];

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
  'Planificacion',
  'Internacionalizacion',
  'Responsabilidad Social Universitaria y Bienestar Universitario',
  'Bienestar Universitario',
  'Investigacion',
  'Formacion Academica',
  'Gestion Docente',
  'Admision',
  'Tesoreria',
  'Biblioteca',
  'Tecnologias de Informacion',
  'Recursos Humanos',
  'Mantenimiento',
  'Servicios Academicos',
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

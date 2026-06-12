/* Registro SAC - formulario conectado a API */

const currentPeDate = () => new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

const campusToCode = (campus) => campus && campus.includes('Lima Norte') ? 'LN' : 'LN';

const FormCard = ({ n, title, sub, right, children }) => (
  <div className="form-card">
    <div className="form-card-head">
      <div className="num">{n}</div>
      <div>
        <div className="ttl">{title}</div>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {right && <div className="right">{right}</div>}
    </div>
    <div className="form-card-body">{children}</div>
  </div>
);

const Field = ({ label, required, children, span, error }) => (
  <div className={'field' + (span ? ' span-' + span : '')}>
    <label className={required ? 'req' : ''}>{label}</label>
    {children}
    {error && <div className="field-error">{error}</div>}
  </div>
);

const Select = ({ value, placeholder, onChange, options, icon = 'chev-down' }) => (
  <window.Combobox value={value} placeholder={placeholder} options={options}
                   onChange={onChange} icon={icon === 'chev-down' ? null : icon} />
);

const validationMap = (payload) => {
  const map = {};
  const detail = payload?.detail;
  if (Array.isArray(detail)) {
    detail.forEach(err => {
      const key = Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : err.field;
      if (key) map[key] = err.msg || err.message || 'Dato invalido';
    });
  }
  return map;
};

const RegistroSAC = ({ onCancel, onSubmit }) => {
  const { createSac, creating } = window.useAppContext();
  const [errors, setErrors] = React.useState({});
  const [form, setForm] = React.useState({
    codigo: '',
    campus: 'UCV — Campus Lima Norte',
    area: '',
    procesoSGC: '',
    procedimiento: '',
    norma: '',
    clausula: '8.7.1 / 10.2',
    originadorTipo: 'Dirección de la Calidad',
    originadorOtro: '',
    respArea: '',
    respAreaCorreo: '',
    fecha: currentPeDate(),
    fuente: '',
    prioridad: '',
    respInm: 'No aplica',
    fechaInm: '',
    nc: '',
    accionInmediata: '',
    analisis: '',
  });

  const [procedimientos, setProcedimientos] = React.useState([]);

  const setField = (k, v) => {
    if (k === 'area') {
      const info = window.findAreaResponsable?.(v);
      setForm(prev => ({
        ...prev,
        area: v,
        respArea: info?.responsable || '',
        respAreaCorreo: info?.correo || '',
      }));
      setErrors(prev => ({...prev, [k]: ''}));
      return;
    }
    setForm(prev => ({...prev, [k]: v}));
    setErrors(prev => ({...prev, [k]: ''}));
  };
  React.useEffect(() => {
    const year = new Date().getFullYear();
    window.SacApi.getNextCode(campusToCode(form.campus), year)
      .then(code => setForm(prev => prev.codigo ? prev : ({...prev, codigo: typeof code === 'string' ? code : code.nextCode || code.codigo || ''})))
      .catch(() => {});
  }, [form.campus]);

  React.useEffect(() => {
    window.SacApi.getCatalogo('procedimientos')
      .then(rows => setProcedimientos((rows || []).map(p => p.label || `${p.codigo} ${p.nombre}`)))
      .catch(() => setProcedimientos([]));
  }, []);

  const requiredFields = [
    ['codigo', 'Codigo SAC'],
    ['campus', 'Campus / filial'],
    ['area', 'Area o programa'],
    ['procesoSGC', 'Proceso del SGC'],
    ['procedimiento', 'Procedimiento'],
    ['norma', 'Norma asociada'],
    ['clausula', 'Clausula / requisito'],
    ['fecha', 'Fecha de registro'],
    ['fuente', 'Fuente de no conformidad'],
    ['prioridad', 'Prioridad'],
    ['respArea', 'Responsable del area'],
    ['nc', 'Descripcion de la no conformidad'],
  ];

  const validateRequired = () => {
    const next = {};
    requiredFields.forEach(([key, label]) => {
      if (!String(form[key] || '').trim()) next[key] = `${label} es requerido.`;
    });
    if (form.originadorTipo === 'Otro' && !String(form.originadorOtro || '').trim()) {
      next.originadorOtro = 'Indique quien origina la SAC.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const payload = () => ({
    code: form.codigo.replace(/^SAC-/, ''),
    codigo: form.codigo,
    campus: campusToCode(form.campus),
    area: form.area,
    proceso: form.area,
    procesoSGC: form.procesoSGC,
    procedimiento: form.procedimiento,
    norma: form.norma,
    clausula: form.clausula,
    originador: form.originadorTipo === 'Otro' ? form.originadorOtro : 'Dirección de la Calidad',
    responsable: form.respArea,
    responsableEmail: form.respAreaCorreo,
    fechaReg: form.fecha,
    fuente: form.fuente,
    prio: form.prioridad.toLowerCase(),
    prioridad: form.prioridad,
    descripcion: form.nc.slice(0, 120),
    nc: form.nc,
    accionInmediata: {
      descripcion: 'No aplica',
      responsable: 'No aplica',
      fecha: '',
    },
    analisis: '',
    planAccion: [],
  });

  const submit = async () => {
    setErrors({});
    if (!validateRequired()) return;
    try {
      await createSac(payload());
      onSubmit && onSubmit();
    } catch (err) {
      setErrors(validationMap(err.payload));
      if (!err.payload?.detail) setErrors({ general: err.message });
    }
  };

  return (
    <div className="form-page">
      {errors.general && <div className="api-error"><Icon name="alert" size={14} />{errors.general}</div>}

      <div className="form-card">
        <div className="form-card-head">
          <div>
            <div className="ttl" style={{fontSize: 16}}>Nueva Solicitud de Accion Correctiva</div>
            <div className="sub" style={{marginTop:2}}>Registro inicial de no conformidad y planificacion de acciones</div>
          </div>
          <div className="right" style={{display:'flex', alignItems:'flex-end', gap:10}}>
            <Field label="Codigo SAC" required error={errors.codigo || errors.code}>
              <input className="input-line"
                     value={form.codigo || ''}
                     onChange={e => setField('codigo', e.target.value)}
                     placeholder="Ej. 04-2026-LN"
                     style={{fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontWeight: 600, color: 'var(--blue-800)', minWidth: 240}} />
            </Field>
          </div>
        </div>
      </div>

      <FormCard n="1" title="Informacion general" sub="Datos institucionales y trazabilidad ISO">
        <div className="form-grid">
          <Field label="Campus / filial" required error={errors.campus}>
            <Select value={form.campus} options={['UCV — Campus Lima Norte', 'UCV — Campus Lima Centro', 'UCV — Campus Trujillo', 'UCV — Campus Chiclayo', 'UCV — Campus Piura']} onChange={v => setField('campus', v)} icon="building" />
          </Field>
          <Field label="Area o programa" required error={errors.area}>
            <Select value={form.area} placeholder="Seleccionar area o programa" options={window.AREAS_LIST} onChange={v => setField('area', v)} icon="folder" />
          </Field>
          <Field label="Proceso del SGC" required error={errors.procesoSGC}>
            <Select value={form.procesoSGC} placeholder="Seleccionar proceso" options={window.PROCESOS_SGC_LIST} onChange={v => setField('procesoSGC', v)} icon="shield" />
          </Field>
          <Field label="Procedimiento" required error={errors.procedimiento}>
            <window.Combobox
              value={form.procedimiento}
              placeholder="Seleccionar procedimiento"
              options={procedimientos}
              onChange={v => setField('procedimiento', v)}
              icon="doc"
              searchable
              searchPlaceholder="Buscar procedimiento..."
            />
          </Field>
          <Field label="Norma asociada" required error={errors.norma}>
            <Select value={form.norma} placeholder="Seleccionar norma" options={['ISO 9001:2015', 'ISO 21001:2018', 'Binorma ISO 9001:2015 / ISO 21001:2018', 'ISO 45001:2018']} onChange={v => setField('norma', v)} icon="shield" />
          </Field>
          <Field label="Clausula / requisito" required error={errors.clausula}>
            <input className="input-line" value={form.clausula} onChange={e => setField('clausula', e.target.value)} placeholder="Ej. 8.7.1 / 10.2" />
          </Field>
          <Field label="Fecha de registro" required error={errors.fechaReg || errors.fecha}>
            <window.DateField value={form.fecha} onChange={v => setField('fecha', v)} />
          </Field>
          <Field label="Originador" error={errors.originadorOtro}>
            <div className="radio-grid" style={{gridTemplateColumns: '1fr', gap: 8}}>
              {['Dirección de la Calidad', 'Otro'].map(opt => (
                <div key={opt}
                     className={'radio-card' + (form.originadorTipo === opt ? ' on' : '')}
                     onClick={() => setField('originadorTipo', opt)}>
                  <span className="bullet"></span>
                  <span className="lab">{opt}</span>
                </div>
              ))}
            </div>
            {form.originadorTipo === 'Otro' && (
              <input className="input-line"
                     value={form.originadorOtro}
                     onChange={e => setField('originadorOtro', e.target.value)}
                     placeholder="Escriba quien crea la SAC" />
            )}
          </Field>
          <Field label="Responsable del area" required error={errors.respArea || errors.responsable}>
            <div className="readonly-stack">
              <div className="input readonly">
                <Icon name="users" size={13} className="ico" />
                <span>{form.respArea || 'Seleccione un area'}</span>
              </div>
              <div className="input readonly">
                <Icon name="mail" size={13} className="ico" />
                <span>{form.respAreaCorreo || 'Sin correo registrado'}</span>
              </div>
            </div>
          </Field>
          <Field label="Prioridad" required error={errors.prioridad}>
            <Select value={form.prioridad} placeholder="Seleccionar prioridad" options={['Alta', 'Media', 'Baja']} onChange={v => setField('prioridad', v)} icon="flag" />
          </Field>
          <Field label="Fuente de no conformidad" required span="3" error={errors.fuente}>
            <div className="radio-grid">
              {window.FUENTES_LIST.map(f => (
                <div key={f} className={'radio-card' + (form.fuente === f ? ' on' : '')} onClick={() => setField('fuente', f)}>
                  <span className="bullet"></span>
                  <span className="lab">{f}</span>
                </div>
              ))}
            </div>
          </Field>
        </div>
      </FormCard>

      <FormCard n="2" title="Descripcion de la no conformidad" sub="Hechos objetivos, evidencias y referencia al requisito incumplido">
        <Field label="" error={errors.nc || errors.descripcion}>
          <textarea className="input-area" style={{minHeight: 120}} value={form.nc}
            onChange={e => setField('nc', e.target.value)}
            placeholder="Describa con claridad la no conformidad detectada: que se observo, donde, cuando, evidencias objetivas y requisito incumplido." />
        </Field>
        <div style={{display:'flex', justifyContent:'space-between', fontSize: 11, color:'var(--text-2)', marginTop: -6}}>
          <span><Icon name="alert" size={11} /> Evite opiniones y juicios de valor. Documente solo hechos.</span>
          <span>{form.nc.length} / 2000 caracteres</span>
        </div>
      </FormCard>

      <div className="form-foot">
        <button className="btn ghost" onClick={onCancel}><Icon name="x" size={13} />Cancelar</button>
        <div className="spacer"></div>
        <button className="btn"><Icon name="download" size={13} />Guardar borrador</button>
        <button className="btn primary" onClick={submit} disabled={creating}>
          {creating ? <span className="spinner"></span> : <Icon name="check" size={13} stroke={2.4} />}
          Registrar SAC
        </button>
      </div>
    </div>
  );
};

window.RegistroSAC = RegistroSAC;

/* Detail drawer */

const Timeline = ({ current, dates, onSelect }) => {
  return (
    <div className="timeline-card">
      <div className="tl-title">
        <Icon name="target" size={15} />
        Progreso del SAC
        <span style={{fontSize: 11, color: 'var(--text-2)', fontWeight: 500, marginLeft: 8}}>
          (Haz clic en una etapa para marcarla)
        </span>
        <span className={'badge ' + (current >= TIMELINE_STEPS.length - 1 ? 'cerrada' : 'ejecucion')} style={{marginLeft: 'auto'}}>
          <span className="d"></span>
          {current >= TIMELINE_STEPS.length - 1 ? 'Cerrada' : `En ${TIMELINE_STEPS[current].label.toLowerCase()}`}
        </span>
      </div>
      <div className="timeline">
        {TIMELINE_STEPS.map((s, i) => {
          const status = i < current ? 'done' : i === current ? 'cur' : '';
          return (
            <button key={s.id}
                    type="button"
                    className={'tl-step ' + status}
                    onClick={() => onSelect && onSelect(i)}
                    title={'Marcar etapa: ' + s.label}>
              <div className="tl-dot">
                <Icon name={status === 'done' ? 'check' : s.icon} size={14} stroke={2.2} />
              </div>
              <div className="tl-lab">{s.label}</div>
              <div className="tl-date">{dates[i] || '—'}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* Editable section wrapper */
const EditableSection = ({ icon, iconTone, title, sectionKey, editingKey, setEditing, headerExtras, children, onSave, onCancel, editable = true }) => {
  const editing = editingKey === sectionKey;
  return (
    <div className={'section' + (editing ? ' editing' : '')}>
      <h3>
        <span className="ico" style={iconTone}>
          <Icon name={icon} size={14} />
        </span>
        {title}
        <div className="right">
          {headerExtras}
          {editable && (
            <button className={'edit-icon' + (editing ? ' active' : '')}
                    title={editing ? 'Editando…' : 'Editar sección'}
                    onClick={() => setEditing(editing ? null : sectionKey)}>
              <Icon name="edit" size={14} />
            </button>
          )}
        </div>
      </h3>
      {typeof children === 'function' ? children(editing) : children}
      {editing && (
        <div className="edit-banner">
          <Icon name="edit" size={12} />
          Editando esta sección — los cambios no se guardan hasta confirmar.
          <div className="spacer"></div>
          <button className="btn sm" onClick={() => { onCancel && onCancel(); setEditing(null); }}>
            <Icon name="x" size={12} />Cancelar edición
          </button>
          <button className="btn sm primary" onClick={() => { onSave && onSave(); setEditing(null); }}>
            <Icon name="check" size={12} stroke={2.6} />Guardar cambios
          </button>
        </div>
      )}
    </div>
  );
};

/* Editable KV — read mode or input/combobox in edit mode */
const KV = ({ k, v, edit, type = 'text', options, mono, highlight, onChange, searchable }) => (
  <div className={'kv' + (highlight ? ' highlight' : '')}>
    <div className="k">{k}</div>
    {edit ? (
      type === 'combo' ? (
        <div style={{marginTop:4}}>
          <window.Combobox value={v} options={options || []} onChange={onChange} searchable={searchable}
                           searchPlaceholder={searchable ? 'Buscar…' : undefined} />
        </div>
      ) : type === 'responsable' ? (
        <div style={{marginTop:4}}>
          <window.ResponsableCombo value={v} onChange={onChange} />
        </div>
      ) : type === 'date' ? (
        <div className="input" style={{marginTop:4}}>
          <Icon name="calendar" size={13} className="ico" />
          <input type="text" defaultValue={v} placeholder="DD/MM/AAAA"
                 style={{flex:1, border:0, outline:0, background:'transparent', font:'inherit', color: 'var(--heading)', minWidth: 0}} />
        </div>
      ) : (
        <input className="input-line" defaultValue={v} style={{marginTop:4}} onChange={e => onChange && onChange(e.target.value)} />
      )
    ) : (
      <div className={'v' + (mono ? ' mono' : '')}>{v}</div>
    )}
  </div>
);

/* Plan-action estado mapping */
const PLAN_ESTADOS = [
  { value: 'pendiente',   label: 'Pendiente',    badge: 'pendiente' },
  { value: 'proceso',     label: 'En proceso',   badge: 'ejecucion' },
  { value: 'implementada',label: 'Implementada', badge: 'analisis' },
  { value: 'verificada',  label: 'Verificada',   badge: 'verificacion' },
  { value: 'completada',  label: 'Completada',   badge: 'cerrada' },
];
const PLAN_ESTADOS_LABELS = PLAN_ESTADOS.map(s => s.label);
const planEstadoByLabel = (lbl) => PLAN_ESTADOS.find(s => s.label === lbl) || PLAN_ESTADOS[0];
const planEstadoByValue = (val) => PLAN_ESTADOS.find(s => s.value === val) ||
  // legacy mappings from older data
  (val === 'cerrada' ? PLAN_ESTADOS[4] :
   val === 'ejecucion' ? PLAN_ESTADOS[1] :
   PLAN_ESTADOS[0]);
const planEstadoLabel = (val) => planEstadoByValue(val).label;
const planEstadoBadge = (val) => planEstadoByValue(val).badge;
const toUiDate = (value) => {
  if (!value || typeof value !== 'string') return value || '';
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
};

const Detail = ({ record, onClose }) => {
  const { updateSac, exportSac, saving, exporting } = window.useAppContext();
  const [tab, setTab] = React.useState('general');
  const [editing, setEditing] = React.useState(null);
  const [causeView, setCauseView] = React.useState('whys');
  const [planRows, setPlanRows] = React.useState([]);
  const [planModal, setPlanModal] = React.useState(null);
  const [tlCurrent, setTlCurrent] = React.useState(0);
  const [tlDates, setTlDates] = React.useState(Array(TIMELINE_STEPS.length).fill(''));
  const handleTlSelect = (i) => {
    setTlCurrent(i);
    // auto-stamp today's date on the selected step if empty
    const today = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
    setTlDates(prev => prev.map((d, idx) => idx === i && !d ? today : d));
  };
  const [verif, setVerif] = React.useState({
    impl_desc: '',
    impl_verif_por: '',
    impl_fecha: '',
    impl_eficacia_desde: '',
    efic_docs: '',
    efic_eficaz: '',
    efic_cierra: '',
    efic_verif_por: '',
    efic_fecha: '',
    efic_obs: '',
  });
  const setV = (k, v) => setVerif(s => ({...s, [k]: v}));

  React.useEffect(() => {
    setTab('general');
    setEditing(null);
    setPlanModal(null);
    setPlanRows((record?.planAccion || record?.plan_accion || PLAN_ACCION).map(row => ({
      ...row,
      resp: row.resp || row.responsable || '',
      fecha: toUiDate(row.fecha),
    })));
    setTlCurrent(Number.isInteger(record?.timeline_step) ? record.timeline_step : 0);
    setTlDates((record?.timeline_dates || []).concat(Array(TIMELINE_STEPS.length).fill('')).slice(0, TIMELINE_STEPS.length));
    setVerif({
      impl_desc: record?.verif_impl_desc || '',
      impl_verif_por: record?.verif_impl_por || '',
      impl_fecha: record?.verif_impl_fecha || '',
      impl_eficacia_desde: record?.verif_impl_eficacia_desde || '',
      efic_docs: record?.verif_efic_docs || '',
      efic_eficaz: record?.verif_efic_eficaz || '',
      efic_cierra: record?.verif_efic_cierra || '',
      efic_verif_por: record?.verif_efic_por || '',
      efic_fecha: record?.verif_efic_fecha || '',
      efic_obs: record?.verif_efic_obs || '',
    });
  }, [record?.id]);

  const timelineEstado = (step) => (
    step >= 6 ? 'cerrada' :
    step >= 5 ? 'verificacion' :
    step >= 3 ? 'ejecucion' :
    step >= 2 ? 'analisis' :
    'pendiente'
  );

  const normalizedPlanRows = () => planRows.map((row, index) => ({
    n: row.n || index + 1,
    orden: row.orden || row.n || index + 1,
    desc: row.desc || '',
    responsable: row.responsable || row.resp || '',
    responsable_av: row.responsable_av || row.av || '',
    av: row.av || row.responsable_av || '',
    fecha: row.fecha || '',
    estado: row.estado || 'pendiente',
  }));

  const buildPayload = () => ({
    estado: timelineEstado(tlCurrent),
    implementacion: Math.round((tlCurrent / Math.max(1, TIMELINE_STEPS.length - 1)) * 100),
    timeline_step: tlCurrent,
    timeline_dates: tlDates,
    planAccion: normalizedPlanRows(),
    verificacion: verif,
  });

  const handleSave = async () => {
    if (!record?.id) return;
    await updateSac(record.id, buildPayload());
    setEditing(null);
  };

  const handleExport = async () => {
    if (!record?.id) return;
    await exportSac(record.id, record.code || record.codigo || record.id);
  };

  if (!record) return null;
  const isOpen = !!record;
  const historyRows = record.historial || [];
  const ncDefault = record.nc || '';
  const accionInmDefault = 'No aplica';

  return (
    <React.Fragment>
      <div className={'scrim' + (isOpen ? ' show' : '')} onClick={onClose}></div>
      <aside className={'drawer' + (isOpen ? ' show' : '')}>
        <div className="dr-head">
          <button className="close" onClick={onClose} title="Cerrar"><Icon name="x" size={16} /></button>
          <div className="crumb">Detalle de Solicitud</div>
          <div className="code">SAC-{record.code}</div>
          <h2>{record.descripcion}</h2>
          <div className="meta-row">
            <div className="item"><Icon name="folder" size={13} />{record.proceso}</div>
            <div className="item"><Icon name="users" size={13} />{record.responsable}</div>
            <div className="item"><Icon name="calendar" size={13} />Registro: {record.fechaReg}</div>
            <div className="item"><Icon name="clock" size={13} />Compromiso: {record.fechaComp}</div>
          </div>
          <div className="tag-row">
            <span className="tag"><Icon name="shield" size={11} />ISO 9001:2015 — Cláusula {record.clausula || '8.7.1 / 10.2'}</span>
            <span className="tag"><Icon name="flag" size={11} />Prioridad {record.prio || 'alta'}</span>
            <span className="tag"><Icon name="building" size={11} />Lima Norte</span>
          </div>
        </div>

        <div className="dr-tabs">
          {[
            { id: 'general', label: 'General', icon: 'doc' },
            { id: 'analisis', label: 'Análisis de causa', icon: 'tree' },
            { id: 'plan', label: 'Plan de acción', icon: 'list-checks', pill: planRows.length },
            { id: 'verif', label: 'Verificación', icon: 'shield-check' },
            { id: 'hist', label: 'Historial', icon: 'history', pill: historyRows.length },
          ].map(t => (
            <div key={t.id}
                 className={'dr-tab' + (tab === t.id ? ' active' : '')}
                 onClick={() => setTab(t.id)}>
              <Icon name={t.icon} size={14} />
              {t.label}
              {t.pill != null && <span className="pill">{t.pill}</span>}
            </div>
          ))}
        </div>

        <div className="dr-body">

          {/* Highlighted strip — always visible */}
          <div className="kv-strip">
            <div className="cell">
              <div className="k">Código SAC</div>
              <div className="v mono">SAC-{record.code}</div>
            </div>
            <div className="cell green">
              <div className="k">Estado</div>
              <div className="v"><span className={'badge ' + record.estado}><span className="d"></span>{record.estadoLabel}</span></div>
            </div>
            <div className="cell amber">
              <div className="k">Fecha compromiso</div>
              <div className="v"><Icon name="clock" size={13} />{record.fechaComp}</div>
            </div>
            <div className="cell red">
              <div className="k">Responsable</div>
              <div className="v">
                <span className="assignee"><span className="av">{record.responsableShort}</span>{record.responsable}</span>
              </div>
            </div>
          </div>

          <Timeline current={tlCurrent} dates={tlDates} onSelect={handleTlSelect} />

          {tab === 'general' && (
            <React.Fragment>
              <EditableSection
                icon="doc"
                title="Información general"
                sectionKey="info"
                editingKey={editing} setEditing={setEditing}
                onSave={handleSave}>
                {(isEdit) => (
                  <div className="kvs">
                    <KV k="Código SAC" v={'SAC-' + record.code} mono edit={isEdit} />
                    <KV k="Área o unidad" v={record.proceso} edit={isEdit}
                        type="combo" options={window.AREAS_LIST} />
                    <KV k="Proceso del SGC" v={record.procesoSGC || 'Formación Académica'} edit={isEdit}
                        type="combo" options={window.PROCESOS_SGC_LIST} />
                    <KV k="Fuente de no conformidad" v={record.fuente} edit={isEdit}
                        type="combo" options={window.FUENTES_LIST} />
                    <KV k="Norma asociada" v={isEdit ? 'ISO 9001:2015' : <span className="tag-norma"><Icon name="shield" size={11} />ISO 9001:2015</span>} edit={isEdit}
                        type="combo" options={['ISO 9001:2015', 'ISO 21001:2018', 'Binorma ISO 9001:2015 / ISO 21001:2018', 'ISO 45001:2018']} />
                    <KV k="Cláusula / requisito" v={record.clausula || '8.7.1 / 10.2'} mono edit={isEdit} />
                    <KV k="Originador" v={record.originador || 'Coord. de Calidad — Auditoría Interna 2026-I'} edit={isEdit} />
                    <KV k="Fecha de registro" v={record.fechaReg} edit={isEdit} type="date" />
                    <KV k="Fecha compromiso" v={record.fechaComp} edit={isEdit} type="date" highlight />
                    <KV k="Prioridad"
                        v={isEdit ? (record.prio === 'alta' ? 'Alta' : record.prio === 'media' ? 'Media' : 'Baja')
                                  : <span className={'badge ' + (record.prio === 'alta' ? 'noeficaz' : record.prio === 'media' ? 'analisis' : 'pendiente')}>
                                      <span className="d"></span>
                                      {record.prio === 'alta' ? 'Alta' : record.prio === 'media' ? 'Media' : 'Baja'}
                                    </span>}
                        edit={isEdit} type="combo" options={['Alta', 'Media', 'Baja']} />
                    <KV k="Estado"
                        v={isEdit ? record.estadoLabel
                                  : <span className={'badge ' + record.estado}><span className="d"></span>{record.estadoLabel}</span>}
                        edit={isEdit} type="combo"
                        options={window.ESTADOS_LIST.map(e => e.label)} />
                    <KV k="Responsable"
                        v={isEdit ? record.responsable
                                  : <span className="assignee"><span className="av">{record.responsableShort}</span>{record.responsable}</span>}
                        edit={isEdit} type="responsable" />
                  </div>
                )}
              </EditableSection>

              <EditableSection
                icon="alert"
                iconTone={{background:'var(--red-bg)', color:'var(--red-tx)'}}
                title="Descripción de la no conformidad"
                sectionKey="nc"
                editingKey={editing} setEditing={setEditing}
                onSave={handleSave}>
                {(isEdit) => (
                  isEdit
                    ? <textarea className="input-area" style={{minHeight:120}} defaultValue={ncDefault} />
                    : <div className="nc-block">
                        <span className="lbl">Descripción</span>
                        {ncDefault}
                      </div>
                )}
              </EditableSection>

              <EditableSection
                icon="sparkles"
                iconTone={{background:'var(--amber-bg)', color:'var(--amber-tx)'}}
                title="Acción inmediata (corrección)"
                sectionKey="accion"
                editingKey={editing} setEditing={setEditing}
                onSave={handleSave}
                editable={false}>
                {(isEdit) => (
                  <React.Fragment>
                    <div className="read-block">{accionInmDefault}</div>
                    <div className="row3" style={{marginTop: 12}}>
                      <div className="field">
                        <label>Responsable asignado</label>
                        <div className="input readonly"><span>No aplica</span></div>
                      </div>
                      <div className="field">
                        <label>Fecha</label>
                        <div className="input readonly"><span>No aplica</span></div>
                      </div>
                      <div className="field">
                        <label>Estado</label>
                        <div className="input readonly"><span>No aplica</span></div>
                      </div>
                    </div>
                  </React.Fragment>
                )}
              </EditableSection>
            </React.Fragment>
          )}

          {tab === 'analisis' && (
            <EditableSection
              icon="tree"
              iconTone={{background:'#FFF7ED', color:'#C2410C'}}
              title="Análisis de causa raíz"
              sectionKey="causa"
              editingKey={editing} setEditing={setEditing}
              onSave={handleSave}
              headerExtras={
                <div className="cause-toggle" style={{margin:0}}>
                  <button className={causeView === 'whys' ? 'on' : ''} onClick={() => setCauseView('whys')}>5 Por qués</button>
                  <button className={causeView === 'fish' ? 'on' : ''} onClick={() => setCauseView('fish')}>Ishikawa</button>
                </div>
              }>
              {(isEdit) => (
                <div className="cause-tree">
                  {causeView === 'whys' ? (
                    <div className="whys">
                      {WHYS.map((w, i) => (
                        <div key={i} className={'why' + (w.root ? ' root' : '')}>
                          <span className="num">{w.n}</span>
                          {isEdit
                            ? <input className="input-line" defaultValue={w.txt} />
                            : <span className="txt">{w.txt}</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Ishikawa />
                  )}
                </div>
              )}
            </EditableSection>
          )}

          {tab === 'plan' && (
            <div className="section">
              <h3>
                <span className="ico"><Icon name="list-checks" size={14} /></span>
                Plan de acción
                <div className="right">
                  <button className="btn sm primary"
                          onClick={() => setPlanModal({ mode: 'create', idx: null, row: { n: planRows.length + 1, desc: '', resp: '', cls: 'g3', av: '?', fecha: '', estado: 'pendiente' } })}>
                    <Icon name="plus" size={13} />Agregar acción
                  </button>
                </div>
              </h3>
              <table className="mini-table">
                <thead>
                  <tr>
                    <th style={{width:36}}>N°</th>
                    <th>Descripción de la acción</th>
                    <th style={{width:180}}>Responsable</th>
                    <th style={{width:140}}>Fecha programada</th>
                    <th style={{width:170}}>Estado</th>
                    <th style={{width:80, textAlign:'right'}}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {planRows.map((p, idx) => (
                    <tr key={idx}>
                      <td><span className="num-cell">{p.n}</span></td>
                      <td>{p.desc || <span style={{color:'var(--text-3)'}}>(sin descripción)</span>}</td>
                      <td>
                        <div className="assignee">
                          <span className={'av ' + (p.cls || 'g3')}>{p.av || '?'}</span>
                          {p.resp || p.responsable || <span style={{color:'var(--text-3)'}}>—</span>}
                        </div>
                      </td>
                      <td>{p.fecha ? <span className="muted">{p.fecha}</span> : <span style={{color:'var(--text-3)'}}>—</span>}</td>
                      <td>
                        <span className={'badge ' + planEstadoBadge(p.estado)}>
                          <span className="d"></span>
                          {planEstadoLabel(p.estado)}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions" style={{justifyContent:'flex-end'}}>
                          <button className="icon-btn" title="Editar acción"
                                  style={{width:28, height:28, border:0, background:'transparent'}}
                                  onClick={() => setPlanModal({ mode: 'edit', idx, row: {...p} })}>
                            <Icon name="edit" size={14} />
                          </button>
                          <button className="icon-btn" title="Eliminar acción"
                                  style={{width:28, height:28, border:0, background:'transparent'}}
                                  onClick={() => setPlanRows(rows => rows.filter((_, i) => i !== idx).map((r, i) => ({...r, n: i + 1})))}>
                            <Icon name="x" size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {planRows.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{textAlign:'center', padding:'24px', color:'var(--text-3)'}}>
                        Sin acciones registradas. Presione <strong style={{color:'var(--blue-700)'}}>Agregar acción</strong> para iniciar el plan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'verif' && (
            <EditableSection
              icon="shield-check"
              iconTone={{background:'var(--green-bg)', color:'var(--green-tx)'}}
              title="Verificación y cierre"
              sectionKey="verif"
              editingKey={editing} setEditing={setEditing}
              onSave={handleSave}>
              {(isEdit) => (
                <React.Fragment>
                  {/* Sub-card 1 — Verificación de la implementación */}
                  <div className="sub-card">
                    <div className="sub-card-title">
                      <span className="badge-step">Paso 1</span>
                      Verificación de la implementación de las acciones correctivas
                    </div>
                    {isEdit
                      ? <textarea className="input-area" style={{minHeight:100}} value={verif.impl_desc} onChange={e => setV('impl_desc', e.target.value)} />
                      : <div className="read-block">{verif.impl_desc}</div>}
                    <div className="row3" style={{marginTop: 12}}>
                      <div className="field">
                        <label>Verificado por</label>
                        {isEdit
                          ? <window.ResponsableCombo value={verif.impl_verif_por} onChange={v => setV('impl_verif_por', v)} />
                          : <div className="input"><div className="assignee"><span className="av g2">LS</span>{verif.impl_verif_por}</div></div>}
                      </div>
                      <div className="field">
                        <label>Fecha</label>
                        {isEdit
                          ? <div className="input"><Icon name="calendar" size={13} className="ico" /><input type="text" value={verif.impl_fecha} onChange={e => setV('impl_fecha', e.target.value)} placeholder="DD/MM/AAAA" style={{flex:1, border:0, outline:0, background:'transparent', font:'inherit', color: 'var(--heading)', minWidth: 0}} /></div>
                          : <div className="input"><Icon name="calendar" size={13} className="ico" /><span>{verif.impl_fecha}</span></div>}
                      </div>
                      <div className="field">
                        <label>Verificar la eficacia a partir de</label>
                        {isEdit
                          ? <input className="input-line" value={verif.impl_eficacia_desde} onChange={e => setV('impl_eficacia_desde', e.target.value)} />
                          : <div className="read-block" style={{padding:'7px 11px'}}>{verif.impl_eficacia_desde}</div>}
                      </div>
                    </div>
                  </div>

                  {/* Sub-card 2 — Verificación de la eficacia */}
                  <div className="sub-card">
                    <div className="sub-card-title">
                      <span className="badge-step">Paso 2</span>
                      Verificación de la eficacia de las acciones correctivas
                    </div>
                    <div className="sub-card-sub">(Detallar los registros o documentación revisada)</div>

                    {isEdit
                      ? <textarea className="input-area" style={{minHeight:100}} value={verif.efic_docs} onChange={e => setV('efic_docs', e.target.value)} placeholder="Detalle los registros o documentación revisada para evaluar la eficacia…" />
                      : <div className="read-block">{verif.efic_docs || <span style={{color:'var(--text-3)'}}>(sin observaciones registradas)</span>}</div>}

                    <div className="row2" style={{marginTop: 14, gap: 16}}>
                      <div>
                        <label style={{fontSize:11.5, color:'var(--text-2)', fontWeight:500, display:'block', marginBottom:6}}>¿La acción tomada fue eficaz?</label>
                        <window.YesNoCheck value={verif.efic_eficaz}
                          onChange={isEdit ? v => setV('efic_eficaz', v) : () => {}} />
                      </div>
                      <div>
                        <label style={{fontSize:11.5, color:'var(--text-2)', fontWeight:500, display:'block', marginBottom:6}}>¿Se cierra la no conformidad?</label>
                        <window.YesNoCheck value={verif.efic_cierra}
                          onChange={isEdit ? v => setV('efic_cierra', v) : () => {}} />
                      </div>
                    </div>

                    <div className="row2" style={{marginTop: 14, gap: 16}}>
                      <div className="field">
                        <label>Verificado por</label>
                        {isEdit
                          ? <window.ResponsableCombo value={verif.efic_verif_por} onChange={v => setV('efic_verif_por', v)} />
                          : <div className="input"><div className="assignee"><span className="av g2">LS</span>{verif.efic_verif_por}</div></div>}
                      </div>
                      <div className="field">
                        <label>Fecha</label>
                        {isEdit
                          ? <div className="input"><Icon name="calendar" size={13} className="ico" /><input type="text" value={verif.efic_fecha} onChange={e => setV('efic_fecha', e.target.value)} placeholder="DD/MM/AAAA" style={{flex:1, border:0, outline:0, background:'transparent', font:'inherit', color: 'var(--heading)', minWidth: 0}} /></div>
                          : <div className="input"><Icon name="calendar" size={13} className="ico" /><span style={{color: verif.efic_fecha ? 'var(--heading)' : 'var(--text-3)'}}>{verif.efic_fecha || 'Pendiente'}</span></div>}
                      </div>
                    </div>

                    <div style={{marginTop: 12}}>
                      <label style={{fontSize:11.5, color:'var(--text-2)', fontWeight:500, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:0.5}}>Observaciones</label>
                      {isEdit
                        ? <textarea className="input-area" value={verif.efic_obs} onChange={e => setV('efic_obs', e.target.value)} placeholder="Observaciones del verificador sobre la eficacia de la acción correctiva…" />
                        : <div className="read-block">{verif.efic_obs || <span style={{color:'var(--text-3)'}}>(sin observaciones registradas)</span>}</div>}
                    </div>
                  </div>
                </React.Fragment>
              )}
            </EditableSection>
          )}

          {tab === 'hist' && (
            <div className="section">
              <h3>
                <span className="ico"><Icon name="history" size={14} /></span>
                Historial de actividad
              </h3>
              <div className="activity">
                {historyRows.length === 0 && (
                  <div className="combo-empty">Sin actividad registrada.</div>
                )}
                {historyRows.map((a, i) => (
                  <div key={i} className={'act ' + a.kind}>
                    <div className="ico"><Icon name={a.icon} size={14} /></div>
                    <div>
                      <div style={{display:'flex', gap:8, alignItems:'baseline'}}>
                        <span className="who">{a.who}</span>
                        <span className="when">{a.when}</span>
                      </div>
                      <div className="what">
                        {a.what}{a.em && <span className="em">{a.em}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="dr-foot">
          <button className="btn"><Icon name="paperclip" size={13} />Adjuntar</button>
          <div className="spacer"></div>
          <button className="btn">Guardar borrador</button>
          <button className="btn" onClick={handleExport} disabled={exporting}>
            {exporting ? <span className="spinner"></span> : <Icon name="download" size={13} />}
            Descargar .docx
          </button>
          <button className="btn primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner"></span> : <Icon name="check" size={13} stroke={2.4} />}
            Guardar cambios
          </button>
        </div>
      </aside>

      {planModal && (
        <PlanEditModal
          mode={planModal.mode}
          row={planModal.row}
          onCancel={() => setPlanModal(null)}
          onSave={(updated) => {
            if (planModal.mode === 'create') {
              setPlanRows(rows => [...rows, {...updated, n: rows.length + 1}]);
            } else {
              setPlanRows(rows => rows.map((r, i) => i === planModal.idx ? {...r, ...updated} : r));
            }
            setPlanModal(null);
          }}
        />
      )}
    </React.Fragment>
  );
};

/* Tiny Ishikawa-style diagram */
const Ishikawa = () => (
  <svg viewBox="0 0 560 200" style={{width: '100%', height: 'auto'}} fontFamily="Inter, sans-serif">
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#1E3A8A" />
      </marker>
    </defs>
    <line x1="40" y1="100" x2="490" y2="100" stroke="#1E3A8A" strokeWidth="2.5" markerEnd="url(#arrow)" />
    <rect x="490" y="78" width="60" height="44" rx="6" fill="#1E3A8A"/>
    <text x="520" y="98" fill="#fff" fontSize="9" fontWeight="700" textAnchor="middle">CAUSA</text>
    <text x="520" y="110" fill="#fff" fontSize="9" fontWeight="700" textAnchor="middle">RAÍZ</text>
    {[
      { x: 100, label: 'Método', cause: 'Falta de control automatizado', up: true },
      { x: 220, label: 'Personas', cause: 'No reciben alertas oportunas', up: true },
      { x: 340, label: 'Sistemas', cause: 'SIGA sin módulo de cumplimiento', up: true },
      { x: 160, label: 'Medición', cause: 'No se mide plazo de registro', up: false },
      { x: 280, label: 'Procedimiento', cause: 'PD-AC-04 sin matriz de control', up: false },
      { x: 400, label: 'Entorno', cause: 'Cargas administrativas paralelas', up: false },
    ].map((b, i) => (
      <g key={i}>
        <line x1={b.x} y1={100} x2={b.x + 50} y2={b.up ? 35 : 165} stroke="#94A3B8" strokeWidth="1.5"/>
        <rect x={b.x + 40} y={b.up ? 20 : 152} width="92" height="28" rx="5" fill="#fff" stroke="#CBD5E1" strokeWidth="1"/>
        <text x={b.x + 86} y={b.up ? 32 : 164} fill="#1E3A8A" fontSize="9.5" fontWeight="700" textAnchor="middle">{b.label}</text>
        <text x={b.x + 86} y={b.up ? 43 : 175} fill="#475569" fontSize="8" textAnchor="middle">{b.cause}</text>
      </g>
    ))}
  </svg>
);

/* === Plan-action edit modal === */
const PlanEditModal = ({ mode, row, onCancel, onSave }) => {
  const [r, setR] = React.useState(row);
  const set = (k, v) => setR(prev => ({...prev, [k]: v}));
  const ref = React.useRef(null);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  React.useEffect(() => {
    // auto-derive initials and color from name
    const responsable = r.resp || r.responsable || '';
    if (responsable) {
      const parts = responsable.trim().split(/\s+/);
      const initials = (parts[0]?.[0] || '?') + (parts[parts.length - 1]?.[0] || '');
      setR(prev => ({...prev, av: initials.toUpperCase()}));
    }
    // eslint-disable-next-line
  }, [r.resp, r.responsable]);

  return (
    <div className="modal-scrim show" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal-card" ref={ref} role="dialog" aria-modal="true">
        <div className="modal-head">
          <div className="ico"><Icon name="edit" size={16} /></div>
          <div>
            <div className="ttl">{mode === 'create' ? 'Nueva acción correctiva' : 'Editar acción correctiva'}</div>
            <div className="sub">Acción N° {r.n} del plan</div>
          </div>
          <button className="modal-close" onClick={onCancel} title="Cerrar">
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div className="field">
            <label className="req">Descripción de la acción</label>
            <textarea className="input-area"
                      style={{minHeight: 120}}
                      value={r.desc}
                      onChange={e => set('desc', e.target.value)}
                      placeholder="Describa con claridad la acción correctiva que eliminará la causa raíz identificada…"
                      autoFocus />
          </div>

          <div className="row2">
            <div className="field">
              <label className="req">Responsable</label>
              <window.ResponsableCombo
                value={r.resp || r.responsable || ''}
                onChange={v => set('resp', v)}
                placeholder="Buscar y seleccionar responsable…"
              />
            </div>
            <div className="field">
              <label className="req">Fecha programada</label>
              <div className="input">
                <Icon name="calendar" size={13} className="ico" />
                <input type="text"
                       value={r.fecha}
                       onChange={e => set('fecha', e.target.value)}
                       placeholder="dd / mm / yyyy"
                       style={{flex:1, border:0, outline:0, background:'transparent', font:'inherit', color:'var(--heading)', minWidth: 0}} />
              </div>
            </div>
          </div>

          <div className="field">
            <label>Estado</label>
            <window.Combobox
              value={planEstadoLabel(r.estado)}
              options={PLAN_ESTADOS_LABELS}
              onChange={v => set('estado', planEstadoByLabel(v).value)}
              icon="flag"
            />
            <div style={{marginTop: 8, display:'flex', alignItems:'center', gap:8}}>
              <span style={{fontSize: 11, color: 'var(--text-2)'}}>Vista previa:</span>
              <span className={'badge ' + planEstadoBadge(r.estado)}>
                <span className="d"></span>
                {planEstadoLabel(r.estado)}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn" onClick={onCancel}>
            <Icon name="x" size={13} />Cancelar
          </button>
          <div style={{flex:1}}></div>
          <button className="btn primary" onClick={() => onSave(r)}>
            <Icon name="check" size={13} stroke={2.6} />Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

window.Detail = Detail;

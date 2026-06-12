/* Main SAC table */

const TableSkeletonRows = () => (
  <React.Fragment>
    {[1, 2, 3, 4].map(i => (
      <tr key={i} className="skeleton-row">
        {Array.from({ length: 12 }).map((_, j) => (
          <td key={j}><span className="sk-line"></span></td>
        ))}
      </tr>
    ))}
  </React.Fragment>
);

const EmptyRows = () => (
  <tr>
    <td colSpan="12" style={{textAlign:'center', padding:'28px', color:'var(--text-3)'}}>
      No se encontraron solicitudes SAC con los filtros seleccionados.
    </td>
  </tr>
);

const Table = ({ rows, selectedId, onSelect }) => {
  const ctx = window.useAppContext();
  const data = rows || ctx.sacs;
  const loading = ctx.loading;
  const error = ctx.error;
  const [menuOpen, setMenuOpen] = React.useState(null);
  const [menuPos, setMenuPos] = React.useState(null);
  const [deleteTarget, setDeleteTarget] = React.useState(null);

  React.useEffect(() => {
    const close = () => setMenuOpen(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const openMail = (record) => {
    const areaInfo = window.findAreaResponsable?.(record.proceso || record.area);
    const to = record.responsableEmail || record.responsable_email || areaInfo?.correo || '';
    const cc = areaInfo?.correoArea || '';
    const code = record.code || record.codigo || record.id;
    const area = record.proceso || record.area || areaInfo?.area || 'su area';
    const responsable = record.responsable || areaInfo?.responsable || '';
    const subject = `Solicitud de Accion Correctiva SAC-${code}`;
    const bodyText = [
      `Estimado/a ${responsable}:`,
      '',
      `Por medio del presente, se remite la Solicitud de Accion Correctiva (SAC-${code}) derivada de la auditoria interna realizada al proceso de ${area}.`,
      '',
      'Como se detalla en el informe correspondiente, se ha identificado una no conformidad especifica vinculada al cumplimiento del procedimiento aplicable al area.',
      '',
      'Para el levantamiento de esta observacion, se cuenta con un plazo maximo de una semana (7 dias calendario) para remitir la SAC completada. Es indispensable que el documento contenga:',
      '',
      '- Analisis de causa: diagnostico que identifique por que se produjo la situacion observada.',
      '- Cuadro de acciones correctivas: propuesta de acciones especificas, responsables y fechas, orientadas a evitar la recurrencia de la no conformidad.',
      '',
      'Se adjunta el formato correspondiente y el informe para su revision. Quedo a disposicion para cualquier consulta tecnica sobre el llenado del documento.',
      '',
      'Saludos cordiales.',
    ].join('\r\n');
    const params = new URLSearchParams({
      view: 'cm',
      fs: '1',
      to,
      su: subject,
      body: bodyText,
    });
    if (cc) params.set('cc', cc);
    window.open(`https://mail.google.com/mail/?${params.toString()}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="table-wrap">
      {error && (
        <div className="api-error">
          <Icon name="alert" size={14} />
          <span>{error}</span>
          <button className="btn sm" onClick={() => ctx.loadSacs(ctx.filters).catch(() => {})}>
            <Icon name="refresh" size={12} />Reintentar
          </button>
        </div>
      )}

      <div className="table-head-bar">
        <div className="ttl">Listado de Solicitudes de Accion Correctiva</div>
        <div className="ct">{loading ? 'Cargando...' : `${data.length} resultados`}</div>
        <div className="right">
          <div className="search-input">
            <Icon name="search" size={14} />
            <input placeholder="Buscar codigo o responsable..." />
          </div>
          <button className="btn sm">
            <Icon name="filter" size={13} />
            Vista
          </button>
          <button className="btn sm">
            <Icon name="download" size={13} />
            Exportar
          </button>
        </div>
      </div>

      <div className="table-scroll">
        <table className="sac">
          <thead>
            <tr>
              <th style={{width: 28}}></th>
              <th>Codigo SAC</th>
              <th>Area o unidad</th>
              <th>Proceso del SGC</th>
              <th>Responsable</th>
              <th>Fuente</th>
              <th>Registro</th>
              <th>Compromiso</th>
              <th>Estado</th>
              <th>Implementacion</th>
              <th>Eficacia</th>
              <th style={{textAlign: 'right'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <TableSkeletonRows /> : data.length === 0 ? <EmptyRows /> : data.map(r => {
              const late = r.daysLeft != null && r.daysLeft < 0;
              const soon = r.daysLeft != null && r.daysLeft >= 0 && r.daysLeft <= 7;
              return (
                <tr key={r.id} className={selectedId === r.id ? 'selected' : ''}
                    onClick={() => onSelect(r.id)}>
                  <td>
                    <div className={'prio ' + (r.prio || 'media')}
                         title={r.prio === 'alta' ? 'Prioridad alta' : r.prio === 'baja' ? 'Prioridad baja' : 'Prioridad media'}>
                      {r.prio === 'alta' ? 'A' : r.prio === 'baja' ? 'B' : 'M'}
                    </div>
                  </td>
                  <td><span className="code">SAC-{r.code || r.codigo || r.id}</span></td>
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                      <span style={{
                        width:24, height:24, borderRadius:6,
                        background:'#EEF2FF', color:'#3730A3',
                        fontSize: 9.5, fontWeight: 700,
                        display:'grid', placeItems:'center'
                      }}>{r.procesoAbbr || '--'}</span>
                      <span>{r.proceso || r.area || '-'}</span>
                    </div>
                  </td>
                  <td><span className="sgc-tag">{r.procesoSGC || '-'}</span></td>
                  <td>
                    <div className="assignee">
                      <span className="av">{r.responsableShort || '--'}</span>
                      {r.responsable || '-'}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      background:'#F1F5F9', color: '#475569',
                      padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500
                    }}>{r.fuente || '-'}</span>
                  </td>
                  <td className="muted">{r.fechaReg || r.fecha || '-'}</td>
                  <td>
                    <div style={{display:'flex', flexDirection:'column', gap:1, lineHeight:1.2}}>
                      <span>{r.fechaComp || '-'}</span>
                      {r.daysLeft != null && (
                        <span style={{
                          fontSize: 10,
                          color: late ? 'var(--red-tx)' : soon ? 'var(--amber-tx)' : 'var(--text-3)',
                          fontWeight: late || soon ? 600 : 500
                        }}>
                          {late ? `${Math.abs(r.daysLeft)} dias vencido` : `${r.daysLeft} dias restantes`}
                        </span>
                      )}
                    </div>
                  </td>
                  <td><span className={'badge ' + (r.estado || 'pendiente')}><span className="d"></span>{r.estadoLabel || r.estado || 'Pendiente'}</span></td>
                  <td>
                    <div className="progress-row">
                      <div className={'progress' + (r.implementacion === 100 ? ' done' : late ? ' late' : (r.implementacion || 0) < 30 ? ' warn' : '')}>
                        <span style={{width: (r.implementacion || 0) + '%'}}></span>
                      </div>
                      <span>{r.implementacion || 0}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={'eficacia ' + (r.eficacia || 'pe')}
                          title={r.eficacia === 'si' ? 'Eficaz' : r.eficacia === 'no' ? 'No eficaz' : 'Pendiente'}>
                      {r.eficacia === 'si' ? '✓' : r.eficacia === 'no' ? '×' : '—'}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions" style={{justifyContent:'flex-end'}} onClick={(e)=>e.stopPropagation()}>
                      <button className="icon-btn" title="Editar" onClick={() => onSelect(r.id)}>
                        <Icon name="edit" size={15} />
                      </button>
                      <button className="icon-btn" title="Adjuntar evidencia">
                        <Icon name="paperclip" size={15} />
                      </button>
                      <button className="icon-btn" title="Enviar correo" onClick={() => openMail(r)}>
                        <Icon name="mail" size={15} />
                      </button>
                      <button className="icon-btn" title="Historial">
                        <Icon name="history" size={15} />
                      </button>
                      <div>
                        <button className="icon-btn" title="Mas opciones" onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          const menuHeight = 48;
                          const spaceBelow = window.innerHeight - rect.bottom - 8;
                          setMenuPos({
                            right: window.innerWidth - rect.right,
                            top: spaceBelow < menuHeight ? null : rect.bottom + 6,
                            bottom: spaceBelow < menuHeight ? window.innerHeight - rect.top + 6 : null,
                          });
                          setMenuOpen(menuOpen === r.id ? null : r.id);
                        }}>
                          <Icon name="more" size={15} />
                        </button>
                        {menuOpen === r.id && menuPos && ReactDOM.createPortal(
                          <div className="row-menu fixed"
                               style={{
                                 right: menuPos.right,
                                 top: menuPos.top == null ? 'auto' : menuPos.top,
                                 bottom: menuPos.bottom == null ? 'auto' : menuPos.bottom,
                               }}
                               onClick={(e) => e.stopPropagation()}>
                            <button className="danger" onClick={() => {
                              setMenuOpen(null);
                              setDeleteTarget(r);
                            }}>
                              <Icon name="x" size={13} />
                              Eliminar SAC
                            </button>
                          </div>,
                          document.body
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pager">
        <span>Mostrando {data.length ? 1 : 0}-{data.length} de {data.length} solicitudes</span>
        <div className="pages">
          <button title="Anterior"><Icon name="chev-left" size={13} /></button>
          <button className="active">1</button>
          <button title="Siguiente"><Icon name="chev-right" size={13} /></button>
        </div>
      </div>
      {deleteTarget && (
        <div className="modal-scrim show confirm-scrim" onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="modal-card confirm-card" role="dialog" aria-modal="true">
            <div className="modal-head">
              <div className="ico"><Icon name="alert" size={16} /></div>
              <div>
                <div className="ttl">Eliminar SAC</div>
                <div className="sub">Esta accion renumerara las SAC restantes.</div>
              </div>
              <button className="modal-close" onClick={() => setDeleteTarget(null)} title="Cerrar">
                <Icon name="x" size={16} />
              </button>
            </div>
            <div className="modal-body">
              ¿Deseas eliminar {deleteTarget.codigo || 'esta SAC'}?
            </div>
            <div className="modal-foot">
              <button className="btn" onClick={() => setDeleteTarget(null)}>
                <Icon name="x" size={13} />Cancelar
              </button>
              <div style={{flex:1}}></div>
              <button className="btn primary" onClick={() => {
                const target = deleteTarget;
                setDeleteTarget(null);
                ctx.deleteSac(target.id).catch(() => {});
              }}>
                <Icon name="check" size={13} stroke={2.6} />Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

window.Table = Table;

/* Main SAC table */

const TableSkeletonRows = () => (
  <React.Fragment>
    {[1, 2, 3, 4].map(i => (
      <tr key={i} className="skeleton-row">
        {Array.from({ length: 13 }).map((_, j) => (
          <td key={j}><span className="sk-line"></span></td>
        ))}
      </tr>
    ))}
  </React.Fragment>
);

const EmptyRows = () => (
  <tr>
    <td colSpan="13" style={{textAlign:'center', padding:'28px', color:'var(--text-3)'}}>
      No se encontraron solicitudes SAC con los filtros seleccionados.
    </td>
  </tr>
);

const Table = ({ rows, selectedId, onSelect }) => {
  const ctx = window.useAppContext();
  const data = rows || ctx.sacs;
  const loading = ctx.loading;
  const error = ctx.error;

  const openMail = (record) => {
    const areaInfo = window.findAreaResponsable?.(record.proceso || record.area);
    const to = record.responsableEmail || record.responsable_email || areaInfo?.correo || '';
    const cc = areaInfo?.correoArea || '';
    const subject = `Seguimiento SAC-${record.code || record.codigo || record.id}`;
    const body = `Estimado/a ${record.responsable || areaInfo?.responsable || ''},%0D%0A%0D%0ASe remite seguimiento de la SAC-${record.code || record.codigo || record.id}.%0D%0A%0D%0ASaludos.`;
    const ccParam = cc ? `&cc=${encodeURIComponent(cc)}` : '';
    window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}${ccParam}&body=${body}`;
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
            <input placeholder="Buscar codigo, descripcion o responsable..." />
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
              <th>Descripcion corta / NC</th>
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
                    <div className="desc">
                      {r.descripcion || r.nc || '-'}
                      <div className="sub">{r.descripcionSub || ''}</div>
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
                      <button className="icon-btn" title="Ver detalle" onClick={() => onSelect(r.id)}>
                        <Icon name="eye" size={15} />
                      </button>
                      <button className="icon-btn" title="Editar" onClick={() => onSelect(r.id)}>
                        <Icon name="edit" size={15} />
                      </button>
                      <button className="icon-btn" title="Adjuntar evidencia">
                        <Icon name="paperclip" size={15} />
                      </button>
                      <button className="icon-btn" title="Comentar">
                        <Icon name="msg" size={15} />
                      </button>
                      <button className="icon-btn" title="Enviar correo" onClick={() => openMail(r)}>
                        <Icon name="mail" size={15} />
                      </button>
                      <button className="icon-btn" title="Historial">
                        <Icon name="history" size={15} />
                      </button>
                      <button className="icon-btn" title="Mas opciones">
                        <Icon name="more" size={15} />
                      </button>
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
    </div>
  );
};

window.Table = Table;

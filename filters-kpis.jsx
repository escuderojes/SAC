/* Filters panel + KPIs */

const campusCode = (campus) => campus && campus.includes('Lima Norte') ? 'LN' : '';

const Filters = ({ filters, setFilters }) => {
  const { loadSacs, loading } = window.useAppContext();

  const toggleEstado = (id) => {
    const cur = filters.estados || ['todas'];
    if (id === 'todas') {
      setFilters({ ...filters, estados: cur.includes('todas') ? [] : ['todas'] });
    } else {
      const without = cur.filter(x => x !== 'todas' && x !== id);
      const next = cur.includes(id) ? without : [...without, id];
      setFilters({ ...filters, estados: next.length === 0 ? ['todas'] : next });
    }
  };

  const reset = () => setFilters({ ...window.DEFAULT_FILTERS });
  const clear = () => setFilters({ ...filters, responsable: '', area: '', procesoSGC: '', fuente: '', estados: ['todas'] });
  const search = () => {
    const query = {
      ...filters,
      campus: campusCode(filters.campus) || filters.campus,
      estado: (filters.estados || []).filter(e => e !== 'todas'),
    };
    delete query.estados;
    loadSacs(query).catch(() => {});
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <Icon name="filter" size={15} />
        <div className="panel-title">Busqueda y filtros</div>
        <div className="panel-tabs">
          <div className="panel-tab active">
            <Icon name="search" size={13} />
            Busqueda detallada
          </div>
          <div className="panel-tab">
            <Icon name="doc" size={13} />
            Por codigo SAC
          </div>
        </div>
      </div>

      <div className="filters">
        <div className="field">
          <label>Campus *</label>
          <window.Combobox
            value={filters.campus}
            options={['UCV — Campus Lima Norte', 'UCV — Campus Lima Centro', 'UCV — Campus Trujillo', 'UCV — Campus Chiclayo', 'UCV — Campus Piura']}
            onChange={v => setFilters({...filters, campus: v})}
            icon="building"
          />
        </div>

        <div className="field">
          <label>Fecha inicio</label>
          <window.DateField value={filters.fechaInicio} onChange={v => setFilters({...filters, fechaInicio: v})} />
        </div>

        <div className="field">
          <label>Fecha fin</label>
          <window.DateField value={filters.fechaFin} onChange={v => setFilters({...filters, fechaFin: v})} />
        </div>

        <div className="field">
          <label>Responsable</label>
          <window.ResponsableCombo
            value={filters.responsable || ''}
            onChange={v => setFilters({...filters, responsable: v})}
            placeholder="Todos los responsables"
          />
        </div>

        <div className="field">
          <label>Area o unidad</label>
          <window.Combobox
            value={filters.area || ''}
            placeholder="Todas las areas"
            options={window.AREAS_LIST}
            onChange={v => setFilters({...filters, area: v})}
            icon="folder"
          />
        </div>

        <div className="field">
          <label>Proceso del SGC</label>
          <window.Combobox
            value={filters.procesoSGC || ''}
            placeholder="Todos los procesos"
            options={window.PROCESOS_SGC_LIST}
            onChange={v => setFilters({...filters, procesoSGC: v})}
            icon="shield"
          />
        </div>

        <div className="field" style={{gridColumn: '1 / -1'}}>
          <label>Estado SAC</label>
          <div className="checks">
            {ESTADOS.map(e => {
              const on = (filters.estados || []).includes(e.id);
              return (
                <label key={e.id} className={'check' + (on ? ' on' : '')}>
                  <input type="checkbox" checked={on} onChange={() => toggleEstado(e.id)} />
                  {e.cls && <span className={'dot-st'} style={{background:
                    e.cls === 'pendiente' ? '#94A3B8' :
                    e.cls === 'analisis' ? '#D97706' :
                    e.cls === 'ejecucion' ? '#2563EB' :
                    e.cls === 'verificacion' ? '#8B5CF6' :
                    e.cls === 'cerrada' ? '#22C55E' :
                    e.cls === 'noeficaz' ? '#EF4444' : '#7F1D1D'
                  }}></span>}
                  {e.label}
                </label>
              );
            })}
          </div>
        </div>

        <div className="field" style={{gridColumn: '1 / -1'}}>
          <label>Fuente de no conformidad</label>
          <div className="radios">
            {FUENTES.map(f => (
              <label key={f} className="radio">
                <input type="radio" name="fuente" checked={filters.fuente === f} onChange={() => setFilters({...filters, fuente: f})} />
                {f}
              </label>
            ))}
          </div>
        </div>

        <div className="actions-row">
          <button className="btn ghost" onClick={reset}>
            <Icon name="refresh" size={14} />
            Restablecer filtros
          </button>
          <div className="spacer"></div>
          <button className="btn">
            <Icon name="download" size={14} />
            Exportar Excel
          </button>
          <button className="btn danger" onClick={clear}>
            <Icon name="x" size={14} />
            Limpiar
          </button>
          <button className="btn primary" onClick={search} disabled={loading}>
            {loading ? <span className="spinner"></span> : <Icon name="search" size={14} />}
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
};

/* Mini sparkline */
const Spark = ({ data, color = '#2563EB', fill = 'rgba(37,99,235,0.12)' }) => {
  const safe = data && data.length > 1 ? data : [0, 0, 0, 0, 0];
  const w = 92, h = 28;
  const max = Math.max(...safe), min = Math.min(...safe);
  const norm = v => h - ((v - min) / Math.max(1, max - min)) * (h - 4) - 2;
  const step = w / (safe.length - 1);
  const pts = safe.map((v, i) => `${(i * step).toFixed(1)},${norm(v).toFixed(1)}`).join(' ');
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polygon points={area} fill={fill} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={norm(safe[safe.length-1])} r="2.5" fill={color} stroke="#fff" strokeWidth="1.5" />
    </svg>
  );
};

const KPIs = () => {
  const { stats, statsLoading } = window.useAppContext();
  const s = stats || {};
  const kpis = [
    { tone: 'blue',  icon: 'list-checks', lab: 'SAC abiertas', val: s.abiertas ?? s.open ?? '—', delta: s.abiertasDelta || '', dir: 'up',
      sub: 'vs mes anterior', dCls: 'neutral', spark: s.abiertasSpark || [0, 0, 0, 0], sparkColor: '#2563EB', sparkFill: 'rgba(37,99,235,0.12)' },
    { tone: 'red',   icon: 'clock-x', lab: 'SAC vencidas', val: s.vencidas ?? s.overdue ?? '—', delta: s.vencidasDelta || '', dir: 'up',
      sub: 'vs mes anterior', dCls: 'up', spark: s.vencidasSpark || [0, 0, 0, 0], sparkColor: '#EF4444', sparkFill: 'rgba(239,68,68,0.10)' },
    { tone: 'green', icon: 'check', lab: 'SAC cerradas este mes', val: s.cerradasMes ?? s.closedThisMonth ?? '—', delta: s.cerradasDelta || '', dir: 'up',
      sub: s.eficacia ? `eficacia ${s.eficacia}` : 'eficacia pendiente', dCls: 'up', spark: s.cerradasSpark || [0, 0, 0, 0], sparkColor: '#22C55E', sparkFill: 'rgba(34,197,94,0.12)' },
    { tone: 'purple',icon: 'clock', lab: 'Tiempo promedio de cierre', val: s.tiempoPromedioCierre ?? s.avgCloseTime ?? '—', delta: s.tiempoDelta || '', dir: 'up',
      sub: 'meta institucional: 45d', dCls: 'up', spark: s.tiempoSpark || [0, 0, 0, 0], sparkColor: '#8B5CF6', sparkFill: 'rgba(139,92,246,0.12)' },
  ];

  return (
    <div className="kpis">
      {kpis.map((k, i) => (
        <div key={i} className={'kpi ' + k.tone}>
          <div className="top">
            <div>
              <div className="lab">{k.lab}</div>
              <div className="val" style={{marginTop:6}}>{statsLoading ? <span className="sk-kpi"></span> : k.val}</div>
            </div>
            <div className="ico"><Icon name={k.icon} size={18} /></div>
          </div>
          <div className="meta">
            <span className={'delta ' + k.dCls}>
              <Icon name={k.dir === 'up' ? 'trend-up' : 'trend-down'} size={11} stroke={2.4} />
              {k.delta || '—'}
            </span>
            <span>{k.sub}</span>
          </div>
          <Spark data={k.spark} color={k.sparkColor} fill={k.sparkFill} />
        </div>
      ))}
    </div>
  );
};

Object.assign(window, { Filters, KPIs });

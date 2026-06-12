/* Area abbreviation catalog */

const Nomenclaturas = () => {
  const [query, setQuery] = React.useState('');
  const [type, setType] = React.useState('todas');
  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return (window.AREAS_RESPONSABLES || [])
      .map(item => ({ ...item, abbr: window.areaAbbr(item.area) }))
      .filter(item => type === 'todas' || item.tipo === type)
      .filter(item => {
        if (!q) return true;
        return [item.area, item.abbr, item.responsable, item.correo]
          .some(value => String(value || '').toLowerCase().includes(q));
      })
      .sort((a, b) => a.area.localeCompare(b.area));
  }, [query, type]);

  return (
    <div className="nomen-page">
      <div className="section nomen-toolbar">
        <div>
          <h3>
            <span className="ico"><Icon name="list" size={14} /></span>
            Nomenclaturas de áreas
          </h3>
          <p className="nomen-sub">
            Estas abreviaturas se usan en el nombre del archivo descargado, por ejemplo: SAC-06-2026-LN INV.
          </p>
        </div>
        <div className="nomen-actions">
          <div className="input nomen-search">
            <Icon name="search" size={13} className="ico" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar área, responsable o abreviatura..."
            />
          </div>
          <div className="nomen-tabs">
            {[
              ['todas', 'Todas'],
              ['programa', 'Programas'],
              ['administrativo', 'Administrativas'],
            ].map(([id, label]) => (
              <button key={id} className={type === id ? 'active' : ''} onClick={() => setType(id)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="section nomen-table-wrap">
        <table className="nomen-table">
          <thead>
            <tr>
              <th style={{width: 110}}>Abreviatura</th>
              <th>Área o programa</th>
              <th style={{width: 130}}>Tipo</th>
              <th style={{width: 260}}>Responsable</th>
              <th style={{width: 240}}>Correo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(item => (
              <tr key={item.area}>
                <td><span className="abbr-chip">{item.abbr}</span></td>
                <td className="area-name">{item.area}</td>
                <td><span className={'type-pill ' + item.tipo}>{item.tipo === 'programa' ? 'Programa' : 'Administrativa'}</span></td>
                <td>{item.responsable}</td>
                <td className="muted">{item.correo || '-'}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan="5" className="nomen-empty">Sin coincidencias.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

window.Nomenclaturas = Nomenclaturas;

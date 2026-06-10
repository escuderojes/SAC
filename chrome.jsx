/* Sidebar + Header + Alerts banner */

const Sidebar = ({ active, setActive }) => {
  const items = [
    { id: 'registro',    label: 'Registro SAC',  icon: 'file-plus' },
    { id: 'monitoreo',   label: 'Monitoreo SAC', icon: 'list-checks', count: 24 },
  ];
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="logo"><Icon name="shield-check" size={20} stroke={2} /></div>
        <div>
          <div className="name">Sistema SAC</div>
          <div className="sub">Gestión de Calidad</div>
        </div>
      </div>
      <div className="sb-section">Acciones correctivas</div>
      <nav className="sb-menu">
        {items.map(it => (
          <div key={it.id}
               className={'sb-item' + (active === it.id ? ' active' : '')}
               onClick={() => setActive(it.id)}>
            <Icon name={it.icon} size={17} />
            <span>{it.label}</span>
            {it.count && <span className="badge-count">{it.count}</span>}
          </div>
        ))}
      </nav>
      <div className="sb-footer">
        <span className="iso-pill">ISO 9001:2015</span>
        <span>v3.2.1</span>
      </div>
    </aside>
  );
};

const Header = ({ campus, title, subtitle, crumb }) => (
  <div className="header">
    <div>
      <div className="crumbs">{crumb || 'Calidad / Acciones correctivas'}</div>
      <h1>{title || 'Monitoreo de Acciones Correctivas'}</h1>
      <div className="sub">{subtitle || 'Gestión, seguimiento y cierre de solicitudes SAC'}</div>
    </div>
    <div className="right">
      <div className="campus-pill">
        <Icon name="building" size={14} />
        {campus}
      </div>
      <button className="icon-btn" title="Notificaciones">
        <Icon name="bell" size={17} />
        <span className="dot"></span>
      </button>
      <button className="icon-btn" title="Ayuda">
        <Icon name="help" size={17} />
      </button>
      <div className="user-chip">
        <div className="av">MQ</div>
        <div>
          <div className="nm">M. Quispe Hurtado</div>
          <div className="rl">Coord. de Calidad</div>
        </div>
        <Icon name="chev-down" size={14} />
      </div>
    </div>
  </div>
);

const AlertsBanner = () => {
  const cards = [
    { tone: 'amber',  icon: 'clock',   lab: 'Próximas a vencer (7 días)', val: '5' },
    { tone: 'red',    icon: 'clock-x', lab: 'SAC vencidas',                val: '2' },
    { tone: 'gray',   icon: 'user-x',  lab: 'Sin responsable asignado',    val: '1' },
    { tone: 'purple', icon: 'shield',  lab: 'Eficacia pendiente de verificar', val: '4' },
  ];
  return (
    <div className="alerts">
      {cards.map((c, i) => (
        <div key={i} className={'alert-card ' + c.tone}>
          <div className="stripe"></div>
          <div className="ico"><Icon name={c.icon} size={18} /></div>
          <div>
            <div className="lab">{c.lab}</div>
            <div className="val">{c.val}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

Object.assign(window, { Sidebar, Header, AlertsBanner });

/* Shared form controls — Combobox, DateField, CheckYesNo */

const Combobox = ({ value, placeholder, options, onChange, icon, disabled, searchable = false, searchPlaceholder = 'Buscar…' }) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [pos, setPos] = React.useState(null);
  const triggerRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const searchRef = React.useRef(null);
  const safeOptions = options || [];
  const canSearch = searchable || safeOptions.length > 10;

  const filtered = React.useMemo(() => {
    if (!canSearch || !query) return safeOptions;
    const q = query.toLowerCase();
    return safeOptions.filter(opt => {
      const label = typeof opt === 'string' ? opt : opt.label;
      return String(label || '').toLowerCase().includes(q);
    });
  }, [safeOptions, query, canSearch]);

  const computePos = React.useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const itemsH = filtered.length * 34 + (canSearch ? 50 : 0) + 8;
    const menuH = Math.min(300, Math.max(60, itemsH));
    const spaceBelow = window.innerHeight - r.bottom - 8;
    const spaceAbove = r.top - 8;
    const dropUp = spaceBelow < menuH && spaceAbove > spaceBelow;
    setPos({
      left: r.left,
      width: r.width,
      top: dropUp ? null : r.bottom + 4,
      bottom: dropUp ? window.innerHeight - r.top + 4 : null,
      maxHeight: Math.max(140, dropUp ? spaceAbove : spaceBelow),
    });
  }, [filtered.length, canSearch]);

  React.useEffect(() => {
    if (!open) { setQuery(''); return; }
    computePos();
    if (canSearch) setTimeout(() => searchRef.current?.focus(), 30);
    const onScrollOrResize = () => computePos();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);

    const onDoc = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
      document.removeEventListener('mousedown', onDoc);
    };
  }, [open, computePos, canSearch]);

  return (
    <div className={'combo' + (open ? ' open' : '') + (disabled ? ' disabled' : '')}>
      <button type="button" className="input combo-trigger"
              ref={triggerRef}
              onClick={() => !disabled && setOpen(o => !o)}>
        {icon && <Icon name={icon} size={14} className="ico" />}
        <span style={{color: value ? 'var(--heading)' : 'var(--text-3)', flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
          {value || placeholder || 'Seleccionar…'}
        </span>
        <Icon name="chev-down" size={14} className="chev" />
      </button>
      {open && pos && ReactDOM.createPortal(
        <div ref={menuRef}
             className={'combo-menu' + (canSearch ? ' searchable' : '')}
             style={{
               position: 'fixed',
               left: pos.left + 'px',
               width: pos.width + 'px',
               top: pos.top != null ? pos.top + 'px' : 'auto',
               bottom: pos.bottom != null ? pos.bottom + 'px' : 'auto',
               maxHeight: pos.maxHeight + 'px',
             }}>
          {canSearch && (
            <div className="combo-search">
              <Icon name="search" size={13} />
              <input ref={searchRef}
                     value={query}
                     onChange={e => setQuery(e.target.value)}
                     placeholder={searchPlaceholder}
                     onKeyDown={e => {
                       if (e.key === 'Escape') setOpen(false);
                       if (e.key === 'Enter' && filtered.length > 0) {
                         const first = filtered[0];
                         const v = typeof first === 'string' ? first : first.value;
                         onChange && onChange(v);
                         setOpen(false);
                       }
                     }} />
              {query && (
                <button type="button" className="combo-search-clear"
                        onClick={() => { setQuery(''); searchRef.current?.focus(); }}
                        title="Limpiar">
                  <Icon name="x" size={11} />
                </button>
              )}
            </div>
          )}
          <div className="combo-list">
            {filtered.length === 0 ? (
              <div className="combo-empty">Sin coincidencias</div>
            ) : filtered.map((opt, i) => {
              const label = typeof opt === 'string' ? opt : opt.label;
              const v = typeof opt === 'string' ? opt : opt.value;
              const selected = v === value;
              return (
                <div key={i}
                     className={'combo-opt' + (selected ? ' selected' : '')}
                     onClick={() => { onChange && onChange(v); setOpen(false); }}>
                  {typeof opt !== 'string' && opt.icon && <Icon name={opt.icon} size={13} />}
                  <span>{canSearch && query ? highlightMatch(label, query) : label}</span>
                  {selected && <Icon name="check" size={13} stroke={2.6} />}
                </div>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

/* Highlight substring matches in dropdown options */
function highlightMatch(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return text;
  return (
    <React.Fragment>
      {text.slice(0, idx)}
      <mark style={{background: 'rgba(37,99,235,0.18)', color: 'var(--blue-800)', padding: '0 1px', borderRadius: 3, fontWeight: 700}}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </React.Fragment>
  );
}

/* Convenience component — Combobox prewired for responsables */
const ResponsableCombo = (props) => (
  <Combobox
    {...props}
    options={props.options || window.RESPONSABLES_LIST}
    icon={props.icon || 'users'}
    searchable
    searchPlaceholder="Buscar responsable…"
    placeholder={props.placeholder || 'Seleccionar responsable…'}
  />
);

const DateField = ({ value, onChange, placeholder = 'DD/MM/AAAA' }) => (
  <div className="input">
    <Icon name="calendar" size={13} className="ico" />
    <input type="text"
           value={value || ''}
           onChange={e => onChange && onChange(e.target.value)}
           placeholder={placeholder}
           style={{flex:1, border:0, outline:0, background:'transparent', font:'inherit', color: 'var(--heading)', minWidth: 0}} />
  </div>
);

const YesNoCheck = ({ value, onChange, label }) => (
  <div className="yesno">
    {label && <span className="yesno-lbl">{label}</span>}
    <label className={'yesno-opt' + (value === 'si' ? ' on' : '')}
           onClick={() => onChange && onChange('si')}>
      <span className="box">{value === 'si' && <Icon name="check" size={11} stroke={3} />}</span>
      SI
    </label>
    <label className={'yesno-opt' + (value === 'no' ? ' on' : ' on-no')}
           onClick={() => onChange && onChange('no')}
           data-no={value === 'no' ? '1' : '0'}>
      <span className="box">{value === 'no' && <Icon name="check" size={11} stroke={3} />}</span>
      NO
    </label>
  </div>
);

Object.assign(window, { Combobox, ResponsableCombo, DateField, YesNoCheck });

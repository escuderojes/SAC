/* Main App */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "Azul",
  "density": "Confort",
  "showAlerts": true
}/*EDITMODE-END*/;

const ACCENT_PRESETS = {
  'Azul':   { '--blue-900':'#1E3A8A', '--blue-800':'#1E40AF', '--blue-700':'#1D4ED8', '--blue-600':'#2563EB', '--blue-500':'#3B82F6', '--blue-100':'#DBEAFE', '--blue-50':'#EFF6FF' },
  'Teal':   { '--blue-900':'#134E4A', '--blue-800':'#115E59', '--blue-700':'#0F766E', '--blue-600':'#0D9488', '--blue-500':'#14B8A6', '--blue-100':'#CCFBF1', '--blue-50':'#F0FDFA' },
  'Indigo': { '--blue-900':'#312E81', '--blue-800':'#3730A3', '--blue-700':'#4338CA', '--blue-600':'#4F46E5', '--blue-500':'#6366F1', '--blue-100':'#E0E7FF', '--blue-50':'#EEF2FF' },
};

const App = () => {
  const {
    sacs,
    filters,
    setFilters,
    selectedId,
    setSelectedId,
    selectedSac,
    loadSacs,
    token,
    user,
    logout,
  } = window.useAppContext();
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  const [active, setActive] = React.useState('monitoreo');

  React.useEffect(() => {
    const preset = ACCENT_PRESETS[tweaks.accent] || ACCENT_PRESETS['Azul'];
    Object.entries(preset).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  }, [tweaks.accent]);

  React.useEffect(() => {
    document.body.style.setProperty('font-size', tweaks.density === 'Compacto' ? '12.5px' : '13.5px');
  }, [tweaks.density]);

  React.useEffect(() => {
    if (token) loadSacs(filters).catch(() => {});
  }, [token]);

  React.useEffect(() => {
    if (active === 'registro') setSelectedId(null);
  }, [active]);

  const isRegistro = active === 'registro';
  const selected = active === 'monitoreo' ? selectedSac : null;

  if (!token) {
    return <LoginPage />;
  }

  return (
    <div className="app">
      <Sidebar active={active} setActive={setActive} />
      <div className="main">
        <Header
          campus={filters.campus}
          user={user}
          onLogout={logout}
          title={isRegistro ? 'Nueva Solicitud de Accion Correctiva' : 'Monitoreo de Acciones Correctivas'}
          subtitle={isRegistro ? 'Registro inicial de no conformidad y planificacion de acciones'
                                : 'Gestion, seguimiento y cierre de solicitudes SAC'}
          crumb={isRegistro ? 'Calidad / Acciones correctivas / Registro' : 'Calidad / Acciones correctivas'}
        />
        <div className="content">
          {isRegistro ? (
            <RegistroSAC
              onCancel={() => setActive('monitoreo')}
              onSubmit={() => setActive('monitoreo')}
            />
          ) : (
            <React.Fragment>
              {tweaks.showAlerts && <AlertsBanner />}
              <KPIs />
              <Filters filters={filters} setFilters={setFilters} />
              <Table rows={sacs} selectedId={selectedId} onSelect={setSelectedId} />
            </React.Fragment>
          )}
        </div>
      </div>
      <Detail record={selected} onClose={() => setSelectedId(null)} />

      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="Apariencia">
          <window.TweakRadio
            label="Tono institucional"
            value={tweaks.accent}
            options={['Azul', 'Teal', 'Indigo']}
            onChange={v => setTweak('accent', v)}
          />
          <window.TweakRadio
            label="Densidad"
            value={tweaks.density}
            options={['Confort', 'Compacto']}
            onChange={v => setTweak('density', v)}
          />
        </window.TweakSection>
        <window.TweakSection label="Navegacion">
          <window.TweakRadio
            label="Pantalla"
            value={active === 'registro' ? 'Registro' : 'Monitoreo'}
            options={['Monitoreo', 'Registro']}
            onChange={v => setActive(v === 'Registro' ? 'registro' : 'monitoreo')}
          />
        </window.TweakSection>
        <window.TweakSection label="Composicion">
          <window.TweakToggle
            label="Banner de alertas"
            value={tweaks.showAlerts}
            onChange={v => setTweak('showAlerts', v)}
          />
          <window.TweakButton
            label="Abrir panel de detalle"
            onClick={() => { setActive('monitoreo'); setSelectedId(sacs[0]?.id || null); }}
          />
          <window.TweakButton
            label="Cerrar panel de detalle"
            onClick={() => setSelectedId(null)}
          />
        </window.TweakSection>
      </window.TweaksPanel>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <window.AppProvider>
    <App />
  </window.AppProvider>
);

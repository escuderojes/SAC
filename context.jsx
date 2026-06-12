/* App-wide state for SAC SPA */

const AppContext = React.createContext(null);

const DEFAULT_FILTERS = {
  campus: 'UCV — Campus Lima Norte',
  estados: ['todas'],
  fuente: '',
  fechaInicio: '',
  fechaFin: '',
  responsable: '',
  area: '',
  procesoSGC: '',
  procedimiento: '',
};

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.items)) return payload.items;
  if (payload && Array.isArray(payload.data)) return payload.data;
  if (payload && Array.isArray(payload.results)) return payload.results;
  return [];
};

const normalizeStats = (payload) => payload || {};

const getErrorText = (err) => err?.message || 'Error de red. Verifique que el backend este disponible.';

const filenameFromDisposition = (disposition) => {
  if (!disposition) return '';
  const utf = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf) return decodeURIComponent(utf[1].replace(/"/g, ''));
  const plain = disposition.match(/filename="?([^"]+)"?/i);
  return plain ? plain[1] : '';
};

const AppProvider = ({ children }) => {
  const [token, setToken] = React.useState(() => window.localStorage?.getItem('sac_token') || '');
  const [user, setUser] = React.useState(() => {
    try {
      return JSON.parse(window.localStorage?.getItem('sac_user') || 'null');
    } catch (err) {
      return null;
    }
  });
  const [sacs, setSacs] = React.useState([]);
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [statsLoading, setStatsLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [selectedId, setSelectedId] = React.useState(null);
  const [selectedSac, setSelectedSac] = React.useState(null);
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS);

  const loadStats = React.useCallback(async (nextFilters = filters) => {
    setStatsLoading(true);
    try {
      const payload = await window.SacApi.getStats(nextFilters);
      setStats(normalizeStats(payload));
    } catch (err) {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, [filters]);

  const loadSacs = React.useCallback(async (nextFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const payload = await window.SacApi.getSacs(nextFilters);
      const list = normalizeList(payload);
      setSacs(list);
      setFilters(prev => ({ ...prev, ...nextFilters }));
      await loadStats(nextFilters);
      return list;
    } catch (err) {
      setError(getErrorText(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters, loadStats, selectedId]);

  const refreshSac = React.useCallback(async (id = selectedId) => {
    if (!id) return null;
    try {
      const sac = await window.SacApi.getSac(id);
      setSelectedSac(sac);
      setSacs(prev => prev.map(item => item.id === id ? { ...item, ...sac } : item));
      return sac;
    } catch (err) {
      setError(getErrorText(err));
      throw err;
    }
  }, [selectedId]);

  React.useEffect(() => {
    let cancelled = false;
    if (!selectedId) {
      setSelectedSac(null);
      return () => { cancelled = true; };
    }
    const listed = sacs.find(item => item.id === selectedId) || null;
    setSelectedSac(listed);
    window.SacApi.getSac(selectedId)
      .then((sac) => {
        if (cancelled) return;
        if (sac?.id !== selectedId) return;
        setSelectedSac(sac);
        setSacs(prev => prev.map(item => item.id === selectedId ? { ...item, ...sac } : item));
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorText(err));
      });
    return () => { cancelled = true; };
  }, [selectedId]);

  const createSac = React.useCallback(async (data) => {
    setCreating(true);
    setError('');
    try {
      const created = await window.SacApi.createSac(data);
      await loadSacs(filters);
      return created;
    } catch (err) {
      setError(getErrorText(err));
      throw err;
    } finally {
      setCreating(false);
    }
  }, [filters, loadSacs]);

  const updateSac = React.useCallback(async (id, data) => {
    setSaving(true);
    setError('');
    try {
      const updated = await window.SacApi.updateSac(id, data);
      setSelectedSac(updated);
      setSacs(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
      await loadStats(filters);
      return updated;
    } catch (err) {
      setError(getErrorText(err));
      throw err;
    } finally {
      setSaving(false);
    }
  }, [filters, loadStats]);

  const exportSac = React.useCallback(async (id, code, area) => {
    setExporting(true);
    setError('');
    try {
      const result = await window.SacApi.exportSac(id);
      const blob = result.blob || result;
      const backendName = filenameFromDisposition(result.headers?.get?.('content-disposition'));
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const abbr = window.areaAbbr?.(area || '') || '';
      const cleanCode = String(code || id || '').replace(/^SAC-/, '');
      const fallbackName = `SAC N ${cleanCode}${abbr ? ' ' + abbr : ''}.docx`;
      link.href = url;
      link.download = backendName || fallbackName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(getErrorText(err));
      throw err;
    } finally {
      setExporting(false);
    }
  }, []);

  const deleteSac = React.useCallback(async (id) => {
    setDeleting(true);
    setError('');
    try {
      await window.SacApi.deleteSac(id);
      if (selectedId === id) {
        setSelectedId(null);
        setSelectedSac(null);
      }
      await loadSacs(filters);
    } catch (err) {
      setError(getErrorText(err));
      throw err;
    } finally {
      setDeleting(false);
    }
  }, [filters, loadSacs, selectedId]);

  const login = React.useCallback(async (email, password) => {
    setError('');
    const payload = await window.SacApi.login(email, password);
    setToken(payload.access_token);
    setUser(payload.user);
    window.localStorage?.setItem('sac_token', payload.access_token);
    window.localStorage?.setItem('sac_user', JSON.stringify(payload.user));
    return payload.user;
  }, []);

  const logout = React.useCallback(() => {
    setToken('');
    setUser(null);
    setSelectedId(null);
    setSelectedSac(null);
    setSacs([]);
    window.localStorage?.removeItem('sac_token');
    window.localStorage?.removeItem('sac_user');
  }, []);

  const value = {
    sacs,
    token,
    user,
    stats,
    loading,
    statsLoading,
    saving,
    creating,
    exporting,
    deleting,
    error,
    setError,
    selectedId,
    setSelectedId,
    selectedSac,
    filters,
    setFilters,
    loadSacs,
    loadStats,
    refreshSac,
    createSac,
    updateSac,
    exportSac,
    deleteSac,
    login,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const useAppContext = () => {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error('useAppContext debe usarse dentro de AppProvider');
  return ctx;
};

Object.assign(window, { AppContext, AppProvider, useAppContext, DEFAULT_FILTERS });

/* API service layer for SAC backend */

const API_BASE = window.SAC_API_BASE || 'http://localhost:8000';

const cleanParams = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value == null || value === '' || value === 'todas') return;
    if (Array.isArray(value)) {
      const values = value.filter(v => v && v !== 'todas');
      if (values.length) params.set(key, values.join(','));
      return;
    }
    params.set(key, value);
  });
  return params.toString();
};

const apiErrorMessage = (payload) => {
  if (!payload) return 'No se pudo completar la solicitud.';
  if (typeof payload === 'string') return payload;
  if (payload.message) return payload.message;
  if (typeof payload.detail === 'string') return payload.detail;
  if (Array.isArray(payload.detail)) {
    return payload.detail.map(e => e.msg || e.message || JSON.stringify(e)).join('\n');
  }
  return 'El servidor devolvio una respuesta no valida.';
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, options);
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    let payload = null;
    try {
      payload = contentType.includes('application/json') ? await response.json() : await response.text();
    } catch (err) {
      payload = null;
    }
    const error = new Error(apiErrorMessage(payload));
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  if (options.blob) return response.blob();
  if (response.status === 204) return null;
  return contentType.includes('application/json') ? response.json() : response.text();
};

const jsonOptions = (method, data) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data || {}),
});

const api = {
  baseUrl: API_BASE,
  getSacs(filters = {}) {
    const qs = cleanParams(filters);
    return request(`/api/sac${qs ? '?' + qs : ''}`);
  },
  getSac(id) {
    return request(`/api/sac/${encodeURIComponent(id)}`);
  },
  getStats(filters = {}) {
    const qs = cleanParams(filters);
    return request(`/api/sac/stats${qs ? '?' + qs : ''}`);
  },
  getNextCode(campus = 'LN', year = new Date().getFullYear()) {
    return request(`/api/sac/next-code?${cleanParams({ campus, year })}`);
  },
  createSac(data) {
    return request('/api/sac', jsonOptions('POST', data));
  },
  updateSac(id, data) {
    return request(`/api/sac/${encodeURIComponent(id)}`, jsonOptions('PUT', data));
  },
  exportSac(id) {
    return request(`/api/sac/${encodeURIComponent(id)}/export`, { blob: true });
  },
};

window.SacApi = api;

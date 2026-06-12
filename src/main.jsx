import React from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import '../styles.css';

window.React = React;
window.ReactDOM = { createRoot, createPortal };
window.SAC_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const init = async () => {
  await import('../tweaks-panel.jsx');
  await import('../icons.jsx');
  await import('../api.jsx');
  await import('../data.jsx');
  await import('../context.jsx');
  await import('../ui.jsx');
  await import('../chrome.jsx');
  await import('../filters-kpis.jsx');
  await import('../table.jsx');
  await import('../detail.jsx');
  await import('../registro.jsx');
  await import('../nomenclaturas.jsx');
  await import('../login.jsx');
  await import('../app.jsx');
};

init();

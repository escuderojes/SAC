/* Lucide-style SVG icons — original strokes (not Lucide's font/asset) */
const Icon = ({ name, size = 16, stroke = 1.75, ...p }) => {
  const common = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor',
    strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round',
    ...p
  };
  switch (name) {
    case 'shield-check': return <svg {...common}><path d="M12 2.5 4 5v7c0 4.6 3.4 8.4 8 9.5 4.6-1.1 8-4.9 8-9.5V5l-8-2.5z"/><path d="m8.5 12 2.5 2.5 4.5-4.5"/></svg>;
    case 'home': return <svg {...common}><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>;
    case 'file-plus': return <svg {...common}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M12 12v6M9 15h6"/></svg>;
    case 'list-checks': return <svg {...common}><path d="m3 6 2 2 3-3"/><path d="m3 14 2 2 3-3"/><path d="M11 7h10M11 15h10"/><path d="M11 19h7"/></svg>;
    case 'bell': return <svg {...common}><path d="M6 8a6 6 0 1 1 12 0c0 4 2 6 2 6H4s2-2 2-6z"/><path d="M10 18a2 2 0 0 0 4 0"/></svg>;
    case 'bar-chart': return <svg {...common}><path d="M3 21h18"/><rect x="6" y="11" width="3" height="8" rx="0.5"/><rect x="11" y="6" width="3" height="13" rx="0.5"/><rect x="16" y="14" width="3" height="5" rx="0.5"/></svg>;
    case 'gauge': return <svg {...common}><path d="M12 14 16 9"/><circle cx="12" cy="14" r="1.5"/><path d="M3.5 16a9 9 0 1 1 17 0"/></svg>;
    case 'cog': return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>;
    case 'search': return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case 'chev-down': return <svg {...common}><path d="m6 9 6 6 6-6"/></svg>;
    case 'chev-right': return <svg {...common}><path d="m9 6 6 6-6 6"/></svg>;
    case 'chev-left': return <svg {...common}><path d="m15 6-6 6 6 6"/></svg>;
    case 'calendar': return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>;
    case 'building': return <svg {...common}><path d="M4 21V5a1 1 0 0 1 1-1h7v17H5a1 1 0 0 1-1-1z"/><path d="M12 11h7a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-7"/><path d="M7 8h2M7 12h2M7 16h2M15 14h2M15 18h2"/></svg>;
    case 'users': return <svg {...common}><circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0"/><circle cx="17" cy="7" r="2.5"/><path d="M16 14a5 5 0 0 1 6 5"/></svg>;
    case 'folder': return <svg {...common}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>;
    case 'check': return <svg {...common}><path d="m5 12 5 5 9-11"/></svg>;
    case 'x': return <svg {...common}><path d="M6 6 18 18M6 18 18 6"/></svg>;
    case 'plus': return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
    case 'download': return <svg {...common}><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>;
    case 'upload': return <svg {...common}><path d="M12 16V5M7 10l5-5 5 5M5 20h14"/></svg>;
    case 'paperclip': return <svg {...common}><path d="m21 10-9 9a5 5 0 1 1-7-7l9-9a3.5 3.5 0 1 1 5 5L10 17a2 2 0 0 1-3-3l8-8"/></svg>;
    case 'msg': return <svg {...common}><path d="M21 12a8 8 0 1 1-3.6-6.7L21 4l-1 4.2A8 8 0 0 1 21 12z"/></svg>;
    case 'eye': return <svg {...common}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/></svg>;
    case 'edit': return <svg {...common}><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/><path d="m18 2 4 4-11 11H7v-4z"/></svg>;
    case 'history': return <svg {...common}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 8v4l3 2"/></svg>;
    case 'more': return <svg {...common}><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></svg>;
    case 'alert': return <svg {...common}><path d="M10.3 3.7 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>;
    case 'clock': return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'clock-x': return <svg {...common}><circle cx="9" cy="13" r="7"/><path d="M9 9v4l2.5 1.5"/><path d="m17 7 5 5M22 7l-5 5"/></svg>;
    case 'user-x': return <svg {...common}><circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="m17 6 5 5M22 6l-5 5"/></svg>;
    case 'flag': return <svg {...common}><path d="M4 21V4M4 4h11l-2 4 2 4H4"/></svg>;
    case 'list': return <svg {...common}><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>;
    case 'tree': return <svg {...common}><circle cx="12" cy="4" r="2"/><path d="M12 6v3"/><path d="M6 12a3 3 0 1 1 6 0M12 12a3 3 0 1 1 6 0"/><path d="M6 15v2M18 15v2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg>;
    case 'doc': return <svg {...common}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h6"/></svg>;
    case 'sparkles': return <svg {...common}><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><path d="m7.5 7.5 1.5 1.5M15 15l1.5 1.5M16.5 7.5 15 9M9 15l-1.5 1.5"/></svg>;
    case 'trend-up': return <svg {...common}><path d="m3 17 6-6 4 4 8-9"/><path d="M14 6h7v7"/></svg>;
    case 'trend-down': return <svg {...common}><path d="m3 7 6 6 4-4 8 9"/><path d="M14 18h7v-7"/></svg>;
    case 'circle': return <svg {...common}><circle cx="12" cy="12" r="9"/></svg>;
    case 'target': return <svg {...common}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>;
    case 'arrow-right': return <svg {...common}><path d="M4 12h16M14 6l6 6-6 6"/></svg>;
    case 'shield': return <svg {...common}><path d="M12 2.5 4 5v7c0 4.6 3.4 8.4 8 9.5 4.6-1.1 8-4.9 8-9.5V5l-8-2.5z"/></svg>;
    case 'help': return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.4 1.6c-.9 1-1.9 1.5-1.9 2.9"/><path d="M12 17h.01"/></svg>;
    case 'pin': return <svg {...common}><path d="M12 2v6"/><path d="M5 8h14l-2 8H7z"/><path d="M12 16v6"/></svg>;
    case 'filter': return <svg {...common}><path d="M3 5h18l-7 9v6l-4-2v-4z"/></svg>;
    case 'refresh': return <svg {...common}><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v5h-5"/></svg>;
    default: return <svg {...common}><circle cx="12" cy="12" r="4"/></svg>;
  }
};

window.Icon = Icon;

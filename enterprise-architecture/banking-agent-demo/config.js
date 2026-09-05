(() => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'live-flow.css';
  document.head.appendChild(link);

  window.RR_BANK_CONFIG = {
    apiBase: '',
    chatPath: '/api/chat'
  };
})();
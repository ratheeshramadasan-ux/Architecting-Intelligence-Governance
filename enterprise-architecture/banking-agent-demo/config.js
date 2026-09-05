(() => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'live-flow.css';
  document.head.appendChild(link);

  window.RR_BANK_CONFIG = {
    // Set apiBase to the deployed RR Bank runtime URL after Railway creates the service domain.
    // Example: https://rr-bank-runtime-production.up.railway.app
    apiBase: '',
    chatStreamPath: '/api/chat/stream',
    modelsPath: '/api/models'
  };
})();
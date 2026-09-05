(() => {
  const root = document;
  const navs = [...root.querySelectorAll('.nav')];
  const views = [...root.querySelectorAll('.view')];
  navs.forEach(btn => btn.addEventListener('click', () => {
    navs.forEach(n => n.classList.toggle('active', n === btn));
    views.forEach(v => v.classList.toggle('active', v.id === btn.dataset.view));
  }));

  const messages = root.getElementById('messages');
  const form = root.getElementById('chatForm');
  const input = root.getElementById('chatInput');
  const traceStatus = root.getElementById('traceStatus');
  const traceList = root.getElementById('traceList');
  const endpointLabel = root.getElementById('endpointLabel');
  const toggleTrace = root.getElementById('toggleTrace');
  const tracePanel = root.getElementById('tracePanel');
  const assistantBody = root.querySelector('.assistant-body');
  const cfg = window.RR_BANK_CONFIG || {};
  const apiBase = (cfg.apiBase || '').replace(/\/$/, '');
  endpointLabel.textContent = (apiBase || '') + '/api/chat';

  if (toggleTrace && tracePanel && assistantBody) {
    toggleTrace.addEventListener('click', () => {
      const hidden = tracePanel.classList.toggle('hidden');
      assistantBody.classList.toggle('trace-hidden', hidden);
      toggleTrace.textContent = hidden ? 'Show Governance Trace' : 'Hide Governance Trace';
    });
  }

  const escapeHtml = value => String(value).replace(/[<>&]/g, s => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[s]));

  const addMessage = (role, text) => {
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  };

  const setTrace = t => {
    const rows = [
      ['Trace ID', t.trace_id || '—'], ['Intent', t.intent || '—'], ['Agent', t.agent || '—'],
      ['Tools', (t.tools || []).join(' → ') || '—'], ['Authorization', t.authorization || '—'],
      ['Policy', t.policy || '—'], ['Result', t.result || '—']
    ];
    traceList.innerHTML = rows.map(([k,v]) => `<dt>${k}</dt><dd>${escapeHtml(v)}</dd>`).join('');
    traceStatus.textContent = t.result || 'Complete';
    traceStatus.className = 'badge ' + ((t.result || '').includes('SUCCESS') ? 'success' : 'neutral');
  };

  const localDemo = prompt => {
    const p = prompt.toLowerCase();
    const id = 'TRACE-DEMO-' + String(Date.now()).slice(-7);
    if (p.includes('acc200008')) {
      return {
        response: 'I’m unable to access or verify that account with your current authenticated session.',
        trace: {trace_id:id,intent:'Account balance lookup',agent:'Accounts Agent',tools:['get_account_balance'],authorization:'RESOURCE_NOT_ACCESSIBLE — existence not disclosed',policy:'POL-AUTH-001',result:'BLOCKED'}
      };
    }
    if (p.includes('credit') && (p.includes('30,000') || p.includes('30000'))) {
      return {
        response:'Your request to increase the credit limit to $30,000 has been submitted for approval. I cannot apply the change directly because the request exceeds the automated approval threshold.',
        trace:{trace_id:id,intent:'Credit limit increase',agent:'Credit Agent',tools:['get_current_limit','get_customer_entitlement','request_credit_limit_change'],authorization:'Authenticated resource access verified',policy:'POL-CRD-017 · HITL required',result:'PENDING_APPROVAL'}
      };
    }
    if (p.includes('savings')) {
      return {
        response:'Your savings account balance is CAD 31,854.18.',
        trace:{trace_id:id,intent:'Savings balance',agent:'Accounts Agent',tools:['get_my_accounts','get_account_balance'],authorization:'Authorized for authenticated customer',policy:'POL-AUTH-001',result:'SUCCESS'}
      };
    }
    if (p.includes('transaction') || p.includes('chequing balance')) {
      return {
        response:'Your chequing account balance is CAD 8,420.32. Your five most recent transactions are: Payroll Deposit +$4,250.00; Prairie Grocers -$126.47; Evergreen Utilities -$184.73; Online Transfer -$250.00; Riverbend Coffee -$8.75.',
        trace:{trace_id:id,intent:'Balance + transaction history',agent:'Accounts Agent',tools:['get_my_accounts','get_account_balance','get_transaction_history'],authorization:'Authorized for authenticated customer',policy:'POL-AUTH-001',result:'SUCCESS'}
      };
    }
    return {response:'This demo currently supports account balance and transactions, unauthorized-account testing, and a $30,000 credit-limit request.',trace:{trace_id:id,intent:'General banking request',agent:'Coordinator Agent',tools:[],authorization:'No protected resource accessed',policy:'—',result:'DEMO_SCOPE'}};
  };

  async function send(prompt) {
    prompt = (prompt || '').trim();
    if (!prompt) return;
    addMessage('user', prompt);
    input.value = '';
    traceStatus.textContent = 'Running';
    let data;
    try {
      const r = await fetch((apiBase || '') + '/api/chat', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:prompt})});
      if (!r.ok) throw new Error('API unavailable');
      data = await r.json();
    } catch (e) {
      data = localDemo(prompt);
    }
    addMessage('assistant', data.response || data.message || 'No response returned.');
    setTrace(data.trace || {});
  }

  form.addEventListener('submit', e => { e.preventDefault(); send(input.value); });
  root.querySelectorAll('.scenario').forEach(b => b.addEventListener('click', () => send(b.dataset.prompt)));

  const steps = {
    1:['User Interface','The customer starts in the branded RR Bank chat. The UI never supplies a trusted Customer_ID; identity is resolved from the authenticated session.','Customer input is untrusted.'],
    2:['Edge Security','Cloud-edge controls protect the public entry point before a request reaches banking services.','WAF, DDoS protection, rate limiting and request controls.'],
    3:['Authentication','The bank identity provider establishes the customer session and authentication strength.','Identity comes from SSO/OIDC/JWT or equivalent — never from the prompt.'],
    4:['Business API Gateway','The request enters a validated API boundary that enforces protocol, schema and route controls.','Reject malformed and disallowed requests early.'],
    5:['PII Protection','Sensitive fields can be detected, classified, minimized, redacted or tokenized before model processing.','PII policy is external to the LLM.'],
    6:['Coordinator Agent','The coordinator understands the intent and delegates to the minimum specialist capability needed.','Routing is not authorization.'],
    7:['Accounts Agent','Handles read-only account discovery and balance operations through approved MCP tools.','Least-privilege tool set.'],
    8:['Transaction Agent','Handles transaction history and statement capabilities through controlled tools.','No direct database access.'],
    9:['Service Agent','Handles address, cheque-book and KYC service journeys, with step-up controls where required.','High-risk updates require deterministic checks.'],
    10:['MCP Capability Layer','MCP exposes business-semantic tools such as get_account_balance rather than generic SQL or arbitrary API execution.','MCP is the controlled AI-facing interface, not the system of record.'],
    11:['FastAPI Business Services','Tools call business APIs, which perform validation, authorization, workflow and system-of-record access.','Business rules are deterministic services.'],
    12:['Authorization','The backend verifies that the authenticated customer may access the requested resource.','Unauthorized and nonexistent resources are normalized externally.'],
    13:['System of Record','Authoritative account, transaction and workflow state lives in the database, independent from conversation memory.','Database/workflow state wins over LLM memory.'],
    14:['Observability & Audit','Each event captures trace, agent, tool, policy and security decision metadata.','Create evidence without unnecessarily logging sensitive payloads.'],
    15:['Evaluation & Cost','Agent quality, safety, tool trajectory, latency and model usage are measured continuously.','Governance includes performance and cost.'],
    16:['Session Store','Conversation context supports multi-turn interaction but does not replace business workflow or system-of-record state.','Separate conversation memory from authoritative state.']
  };
  const title = root.getElementById('stepTitle'), text = root.getElementById('stepText'), control = root.getElementById('stepControl');
  root.querySelectorAll('.flow-node[data-step]').forEach(n => n.addEventListener('click', () => {
    root.querySelectorAll('.flow-node').forEach(x => x.classList.remove('selected'));
    n.classList.add('selected');
    const s = steps[n.dataset.step];
    title.textContent = `${n.dataset.step} — ${s[0]}`;
    text.textContent = s[1];
    control.textContent = s[2];
  }));
})();
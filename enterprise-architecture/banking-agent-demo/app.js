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
  const sendButton = root.getElementById('sendButton');
  const traceStatus = root.getElementById('traceStatus');
  const traceList = root.getElementById('traceList');
  const endpointLabel = root.getElementById('endpointLabel');
  const connectionState = root.getElementById('connectionState');
  const apiStatus = root.getElementById('apiStatus');
  const toggleTrace = root.getElementById('toggleTrace');
  const tracePanel = root.getElementById('tracePanel');
  const assistantBody = root.querySelector('.assistant-body');
  const modelSelect = root.getElementById('modelSelect');
  const modelBadge = root.getElementById('modelBadge');
  const liveModelLabel = root.getElementById('liveModelLabel');
  const liveAgentLabel = root.getElementById('liveAgentLabel');
  const flowCaption = root.getElementById('flowCaption');
  const typingState = root.getElementById('typingState');

  const cfg = window.RR_BANK_CONFIG || {};
  const apiBase = (cfg.apiBase || '').replace(/\/$/, '');
  const chatPath = cfg.chatPath || '/api/chat';
  const apiUrl = apiBase + chatPath;
  endpointLabel.textContent = apiUrl;

  const modelMap = {
    'google:gemini-2.5-flash': { provider:'google', model:'gemini-2.5-flash', label:'Gemini 2.5 Flash' },
    'anthropic:claude-sonnet': { provider:'anthropic', model:'claude-sonnet', label:'Claude Sonnet' },
    'openai:gpt': { provider:'openai', model:'gpt', label:'OpenAI GPT' },
    'selfhosted:custom': { provider:'selfhosted', model:'custom', label:'Self-hosted Custom' }
  };

  function selectedModel() {
    return modelMap[modelSelect.value] || modelMap['google:gemini-2.5-flash'];
  }

  function updateModelDisplay() {
    const m = selectedModel();
    modelBadge.textContent = m.label;
    liveModelLabel.textContent = m.label;
    const traceModel = root.getElementById('traceModel');
    if (traceModel) traceModel.textContent = m.label;
  }
  modelSelect.addEventListener('change', updateModelDisplay);
  updateModelDisplay();

  if (toggleTrace && tracePanel && assistantBody) {
    toggleTrace.addEventListener('click', () => {
      const hidden = tracePanel.classList.toggle('hidden');
      assistantBody.classList.toggle('trace-hidden', hidden);
      toggleTrace.textContent = hidden ? 'Show Governance Trace' : 'Hide Governance Trace';
    });
  }

  const escapeHtml = value => String(value).replace(/[<>&]/g, s => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[s]));

  const addMessage = (role, text, meta) => {
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    if (meta) {
      const m = document.createElement('div');
      m.className = 'msg-meta';
      m.textContent = meta;
      div.appendChild(m);
    }
    const body = document.createElement('div');
    body.textContent = text;
    div.appendChild(body);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  };

  const setApiState = (state, detail) => {
    apiStatus.className = 'badge ' + (state === 'live' ? 'live' : state === 'offline' ? 'offline' : 'neutral');
    apiStatus.textContent = state === 'live' ? 'LIVE' : state === 'offline' ? 'OFFLINE' : 'READY';
    connectionState.textContent = detail;
  };

  const setTrace = t => {
    const current = selectedModel();
    const llmLabel = t.llm_model || t.model || current.label;
    const rows = [
      ['Trace ID', t.trace_id || '—'],
      ['Intent', t.intent || '—'],
      ['Agent', t.agent || '—'],
      ['LLM', llmLabel],
      ['Tools', (t.tools || []).join(' → ') || '—'],
      ['Authorization', t.authorization || '—'],
      ['Policy', t.policy || '—'],
      ['Result', t.result || '—']
    ];
    traceList.innerHTML = rows.map(([k,v]) => `<dt>${k}</dt><dd>${escapeHtml(v)}</dd>`).join('');
    traceStatus.textContent = t.result || 'Complete';
    traceStatus.className = 'badge ' + ((t.result || '').includes('SUCCESS') ? 'success' : 'neutral');
    if (t.agent) liveAgentLabel.textContent = t.agent;
    if (llmLabel) {
      modelBadge.textContent = llmLabel;
      liveModelLabel.textContent = llmLabel;
    }
  };

  const liveStages = [...root.querySelectorAll('.live-stage')];
  const liveWires = [...root.querySelectorAll('.flow-wire')];
  let animationToken = 0;

  function resetLiveFlow() {
    liveStages.forEach(n => n.classList.remove('active','complete','blocked'));
    liveWires.forEach(w => w.classList.remove('active'));
  }

  function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  async function animateRequestFlow(token) {
    resetLiveFlow();
    const stages = ['ui','edge','agent','llm','mcp','api','data'];
    for (let i=0; i<stages.length; i++) {
      if (token !== animationToken) return;
      liveStages.forEach(n => n.classList.remove('active'));
      const node = root.querySelector(`[data-live-step="${stages[i]}"]`);
      if (node) node.classList.add('active');
      if (i > 0) {
        const prev = root.querySelector(`[data-live-step="${stages[i-1]}"]`);
        if (prev) prev.classList.add('complete');
      }
      if (i < liveWires.length) liveWires[i].classList.add('active');
      flowCaption.textContent =
        i < 2 ? 'Securing and validating request' :
        i < 4 ? 'Agent routing and model reasoning' :
        i < 6 ? 'Invoking governed tools and business APIs' :
        'Accessing authorized system-of-record data';
      await sleep(520);
      if (i < liveWires.length) liveWires[i].classList.remove('active');
    }
  }

  function finishFlow(result) {
    animationToken++;
    liveStages.forEach(n => n.classList.remove('active'));
    liveWires.forEach(w => w.classList.remove('active'));
    if ((result || '').toUpperCase().includes('BLOCK') || (result || '').toUpperCase().includes('DENIED') || (result || '').toUpperCase().includes('NOT_ACCESSIBLE')) {
      const apiNode = root.querySelector('[data-live-step="api"]');
      if (apiNode) apiNode.classList.add('blocked');
      flowCaption.textContent = 'Request stopped by authorization or policy control';
    } else {
      liveStages.forEach(n => n.classList.add('complete'));
      flowCaption.textContent = 'Request completed with governance trace captured';
    }
  }

  async function send(prompt) {
    prompt = (prompt || '').trim();
    if (!prompt || sendButton.disabled) return;

    const m = selectedModel();
    addMessage('user', prompt, 'You · Authenticated RR Bank session');
    input.value = '';
    sendButton.disabled = true;
    modelSelect.disabled = true;
    typingState.hidden = false;
    traceStatus.textContent = 'Running';
    traceStatus.className = 'badge neutral';
    setApiState('ready', `Calling ${m.label} through the governed agent runtime…`);

    const token = ++animationToken;
    animateRequestFlow(token);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const r = await fetch(apiUrl, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          message:prompt,
          llm:{provider:m.provider, model:m.model},
          client_context:{channel:'rr-bank-web-demo'}
        }),
        signal:controller.signal
      });
      clearTimeout(timeout);

      if (!r.ok) {
        const text = await r.text().catch(() => '');
        throw new Error(`Agent runtime returned HTTP ${r.status}${text ? ': ' + text.slice(0,120) : ''}`);
      }

      const data = await r.json();
      const responseText = data.response || data.message;
      if (!responseText) throw new Error('Agent runtime returned no customer response.');

      setApiState('live', `Live response received from ${data.trace?.llm_model || m.label}`);
      addMessage('assistant', responseText, `RR Bank Assistant · ${data.trace?.llm_model || m.label}`);
      setTrace(data.trace || {llm_model:m.label,result:'SUCCESS'});
      finishFlow(data.trace?.result || 'SUCCESS');
    } catch (e) {
      finishFlow('BLOCKED');
      setApiState('offline', 'Live agent runtime is not available. No synthetic banking answer was generated.');
      addMessage(
        'assistant',
        'The live AI banking service is temporarily unavailable. Please try again after the governed agent runtime is connected.',
        'RR Bank Assistant · Service status'
      );
      setTrace({
        trace_id:'—',
        intent:'Request not executed',
        agent:'—',
        llm_model:m.label,
        tools:[],
        authorization:'No banking data accessed',
        policy:'Fail closed',
        result:'SERVICE_UNAVAILABLE'
      });
      console.warn('RR Bank live demo request failed:', e);
    } finally {
      typingState.hidden = true;
      sendButton.disabled = false;
      modelSelect.disabled = false;
      input.focus();
    }
  }

  form.addEventListener('submit', e => { e.preventDefault(); send(input.value); });
  root.querySelectorAll('.scenario').forEach(b => b.addEventListener('click', () => {
    input.value = b.dataset.prompt;
    input.focus();
  }));

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
    10:['MCP Capability Layer','MCP exposes business-semantic tools rather than generic SQL or arbitrary API execution.','MCP is the controlled AI-facing interface, not the system of record.'],
    11:['FastAPI Business Services','Tools call business APIs, which perform validation, authorization, workflow and system-of-record access.','Business rules are deterministic services.'],
    12:['Authorization','The backend verifies that the authenticated customer may access the requested resource.','Unauthorized and nonexistent resources are normalized externally.'],
    13:['System of Record','Authoritative account, transaction and workflow state lives in the database, independent from conversation memory.','Database/workflow state wins over LLM memory.'],
    14:['Observability & Audit','Each event captures trace, agent, tool, model, policy and security decision metadata.','Create evidence without unnecessarily logging sensitive payloads.'],
    15:['Evaluation & Cost','Agent quality, safety, tool trajectory, latency, model selection and usage are measured continuously.','Governance includes performance and cost.'],
    16:['Session Store','Conversation context supports multi-turn interaction but does not replace business workflow or system-of-record state.','Separate conversation memory from authoritative state.']
  };

  const title = root.getElementById('stepTitle');
  const text = root.getElementById('stepText');
  const control = root.getElementById('stepControl');
  root.querySelectorAll('.flow-node[data-step]').forEach(n => n.addEventListener('click', () => {
    root.querySelectorAll('.flow-node').forEach(x => x.classList.remove('selected'));
    n.classList.add('selected');
    const s = steps[n.dataset.step];
    title.textContent = `${n.dataset.step} — ${s[0]}`;
    text.textContent = s[1];
    control.textContent = s[2];
  }));

  setApiState('ready', 'Ready for live governed-agent connection. No silent mock-response mode.');
})();
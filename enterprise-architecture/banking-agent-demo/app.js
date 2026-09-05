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
  const streamPath = cfg.chatStreamPath || '/api/chat/stream';
  const modelsPath = cfg.modelsPath || '/api/models';
  const apiUrl = apiBase + streamPath;
  endpointLabel.textContent = apiUrl;

  let sessionId = null;
  let modelRegistry = {};

  if (toggleTrace && tracePanel && assistantBody) {
    toggleTrace.addEventListener('click', () => {
      const hidden = tracePanel.classList.toggle('hidden');
      assistantBody.classList.toggle('trace-hidden', hidden);
      toggleTrace.textContent = hidden ? 'Show Governance Trace' : 'Hide Governance Trace';
    });
  }

  const escapeHtml = value => String(value).replace(/[<>&]/g, s => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[s]));

  function addMessage(role, text, meta) {
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
  }

  function setApiState(state, detail) {
    if (!apiStatus) return;
    apiStatus.className = 'badge ' + (state === 'live' ? 'live' : state === 'offline' ? 'offline' : 'neutral');
    apiStatus.textContent = state === 'live' ? 'LIVE' : state === 'offline' ? 'OFFLINE' : 'READY';
    if (connectionState) connectionState.textContent = detail;
  }

  function selectedModelKey() {
    return modelSelect?.value || 'google:gemini-2.5-flash';
  }

  function selectedModelLabel() {
    return modelRegistry[selectedModelKey()]?.label || modelSelect?.selectedOptions?.[0]?.textContent || 'Approved LLM';
  }

  function updateModelDisplay() {
    const label = selectedModelLabel();
    if (modelBadge) modelBadge.textContent = label;
    if (liveModelLabel) liveModelLabel.textContent = label;
  }
  modelSelect?.addEventListener('change', updateModelDisplay);

  async function loadModels() {
    try {
      const r = await fetch(apiBase + modelsPath, {headers:{'Accept':'application/json'}});
      if (!r.ok) throw new Error('Model registry unavailable');
      const data = await r.json();
      modelRegistry = Object.fromEntries((data.models || []).map(m => [m.id, m]));
      if (modelSelect) {
        modelSelect.innerHTML = '';
        (data.models || []).forEach(m => {
          const o = document.createElement('option');
          o.value = m.id;
          o.textContent = m.enabled ? m.label : `${m.label} — not configured`;
          o.disabled = !m.enabled;
          if (m.id === data.default) o.selected = true;
          modelSelect.appendChild(o);
        });
      }
      updateModelDisplay();
      setApiState('live', 'Governed agent runtime connected. Model registry loaded.');
    } catch (e) {
      updateModelDisplay();
      setApiState('offline', 'Agent runtime is not connected yet. Banking requests will fail closed.');
    }
  }

  function setTrace(t) {
    const rows = [
      ['Trace ID', t.trace_id || '—'],
      ['Intent', t.intent || 'Live banking request'],
      ['Agent', t.agent || 'RR Bank Coordinator'],
      ['LLM', t.llm_model || selectedModelLabel()],
      ['Tools', (t.tools || []).join(' → ') || '—'],
      ['Authorization', t.authorization || 'Backend enforced'],
      ['Policy', t.policy || 'RR Bank governed execution'],
      ['Result', t.result || 'RUNNING']
    ];
    if (traceList) traceList.innerHTML = rows.map(([k,v]) => `<dt>${k}</dt><dd>${escapeHtml(v)}</dd>`).join('');
    if (traceStatus) {
      traceStatus.textContent = t.result || 'Running';
      traceStatus.className = 'badge ' + ((t.result || '').includes('SUCCESS') ? 'success' : 'neutral');
    }
  }

  const liveStages = [...root.querySelectorAll('.live-stage')];
  const liveWires = [...root.querySelectorAll('.flow-wire')];

  function resetLiveFlow() {
    liveStages.forEach(n => n.classList.remove('active','complete','blocked'));
    liveWires.forEach(w => w.classList.remove('active'));
  }

  function node(step) { return root.querySelector(`[data-live-step="${step}"]`); }
  function complete(step) { const n=node(step); if(n){n.classList.remove('active');n.classList.add('complete');} }
  function active(step) { const n=node(step); if(n){n.classList.remove('complete','blocked');n.classList.add('active');} }
  function blocked(step) { const n=node(step); if(n){n.classList.remove('active','complete');n.classList.add('blocked');} }
  function wirePulse(index) {
    const w = liveWires[index];
    if (!w) return;
    w.classList.add('active');
    setTimeout(() => w.classList.remove('active'), 700);
  }

  function applyLiveEvent(evt, trace) {
    switch (evt.type) {
      case 'trace':
        trace.trace_id = evt.trace_id;
        sessionId = evt.session_id || sessionId;
        active('ui');
        flowCaption.textContent = 'Request received from authenticated RR Bank chat';
        break;
      case 'stage':
        if (evt.stage === 'REQUEST_RECEIVED') { complete('ui'); active('edge'); wirePulse(0); flowCaption.textContent='Request accepted at the governed service boundary'; }
        if (evt.stage === 'IDENTITY_CONTEXT') { complete('edge'); active('agent'); wirePulse(1); flowCaption.textContent='Trusted identity resolved server-side; prompt cannot override Customer_ID'; }
        if (evt.stage === 'MODEL_CALL' && evt.status === 'active') { complete('agent'); active('llm'); wirePulse(2); trace.llm_model=evt.model; flowCaption.textContent=`${evt.model || 'Approved LLM'} is reasoning over approved capabilities`; }
        if (evt.stage === 'MODEL_CALL' && evt.status === 'complete') { complete('llm'); }
        if (evt.stage === 'RESPONSE_VALIDATION' && trace.result === 'RUNNING') { complete('api'); complete('data'); flowCaption.textContent='Response validation and governance evidence capture'; }
        break;
      case 'tool_call':
        complete('llm'); active('mcp'); wirePulse(3);
        if(evt.tool && !trace.tools.includes(evt.tool)) trace.tools.push(evt.tool);
        flowCaption.textContent=`MCP tool invoked: ${evt.tool}`;
        break;
      case 'tool_result': {
        const outcome = String(evt.outcome || 'SUCCESS');
        if (evt.policy_id) trace.policy = evt.policy_id;
        if (outcome === 'RESOURCE_NOT_ACCESSIBLE') {
          complete('mcp'); blocked('api'); blocked('data');
          trace.authorization = 'RESOURCE_NOT_ACCESSIBLE · resource existence not disclosed';
          trace.result = 'BLOCKED';
          flowCaption.textContent = 'Authorization stopped the request; no account existence or data was disclosed';
        } else if (outcome === 'PENDING_APPROVAL') {
          complete('mcp'); complete('api'); complete('data');
          trace.authorization = 'Authenticated request accepted; execution withheld';
          trace.result = 'PENDING_APPROVAL';
          flowCaption.textContent = 'Request persisted for human approval; the LLM cannot self-approve';
        } else if (outcome === 'ERROR') {
          complete('mcp'); blocked('api');
          trace.result = 'ERROR';
          flowCaption.textContent = 'Business service returned an error; execution stopped safely';
        } else {
          complete('mcp'); active('api'); wirePulse(4); active('data'); wirePulse(5);
          flowCaption.textContent=`Business API completed governed tool: ${evt.tool}`;
        }
        break;
      }
      case 'error':
        blocked('api');
        trace.result='SERVICE_UNAVAILABLE';
        flowCaption.textContent='Execution stopped safely; no synthetic banking result generated';
        break;
    }
    setTrace(trace);
  }

  async function readSse(response, onEvent) {
    if (!response.body) throw new Error('Streaming response body unavailable');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const {value, done} = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), {stream:!done});
      const blocks = buffer.split(/\n\n/);
      buffer = blocks.pop() || '';
      for (const block of blocks) {
        for (const line of block.split(/\n/)) {
          if (!line.startsWith('data:')) continue;
          const raw = line.slice(5).trim();
          if (!raw) continue;
          onEvent(JSON.parse(raw));
        }
      }
      if (done) break;
    }
  }

  async function send(prompt) {
    prompt = (prompt || '').trim();
    if (!prompt || sendButton?.disabled) return;

    addMessage('user', prompt, 'You · Authenticated RR Bank demo session');
    input.value = '';
    if (sendButton) sendButton.disabled = true;
    if (modelSelect) modelSelect.disabled = true;
    if (typingState) typingState.hidden = false;
    resetLiveFlow();

    const trace = {trace_id:'—',agent:'RR Bank Coordinator',llm_model:selectedModelLabel(),tools:[],authorization:'Backend enforced',policy:'Governed execution',result:'RUNNING'};
    setTrace(trace);
    setApiState('ready', `Executing with ${selectedModelLabel()}…`);

    let finalEvent = null;
    let errorEvent = null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      const r = await fetch(apiUrl, {
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'text/event-stream'},
        body:JSON.stringify({message:prompt, model:selectedModelKey(), session_id:sessionId}),
        signal:controller.signal
      });
      clearTimeout(timeout);
      if (!r.ok) throw new Error(`Agent runtime returned HTTP ${r.status}`);

      await readSse(r, evt => {
        if (evt.session_id) sessionId = evt.session_id;
        if (evt.trace_id) trace.trace_id = evt.trace_id;
        if (evt.type === 'final') finalEvent = evt;
        if (evt.type === 'error') errorEvent = evt;
        applyLiveEvent(evt, trace);
      });

      if (errorEvent) throw new Error(errorEvent.message || 'Governed runtime error');
      if (!finalEvent?.response) throw new Error('Agent runtime returned no final response');

      trace.result = finalEvent.result || trace.result || 'SUCCESS';
      trace.llm_model = finalEvent.model || trace.llm_model;
      if (Array.isArray(finalEvent.tools)) trace.tools = [...new Set(finalEvent.tools)];
      if (Array.isArray(finalEvent.policy_ids) && finalEvent.policy_ids.length) trace.policy = finalEvent.policy_ids.join(', ');

      if (trace.result === 'BLOCKED') {
        blocked('api'); blocked('data');
        trace.authorization = 'RESOURCE_NOT_ACCESSIBLE · resource existence not disclosed';
        flowCaption.textContent = 'Request blocked by backend authorization; no protected data disclosed';
      } else if (trace.result === 'PENDING_APPROVAL') {
        liveStages.forEach(n => { n.classList.remove('active','blocked'); n.classList.add('complete'); });
        trace.authorization = 'Request accepted; protected action pending human approval';
        flowCaption.textContent = 'Request completed to PENDING_APPROVAL; no autonomous credit execution occurred';
      } else if (trace.result === 'SUCCESS') {
        liveStages.forEach(n => { n.classList.remove('active','blocked'); n.classList.add('complete'); });
        flowCaption.textContent = 'Live request completed; governance trace captured';
      }

      setTrace(trace);
      setApiState('live', `Live response from ${trace.llm_model}`);
      addMessage('assistant', finalEvent.response, `RR Bank Assistant · ${trace.llm_model}`);
    } catch (e) {
      blocked('api');
      trace.result = 'SERVICE_UNAVAILABLE';
      trace.authorization = 'No synthetic banking result returned';
      setTrace(trace);
      setApiState('offline', 'Live governed runtime unavailable. Request failed closed.');
      flowCaption.textContent = 'Request stopped safely; no dummy banking answer was generated';
      addMessage('assistant', 'The live AI banking service is temporarily unavailable. No banking result was generated.', 'RR Bank Assistant · Service status');
      console.warn('RR Bank request failed:', e);
    } finally {
      if (typingState) typingState.hidden = true;
      if (sendButton) sendButton.disabled = false;
      if (modelSelect) modelSelect.disabled = false;
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
    6:['Coordinator Agent','The coordinator understands intent and delegates only to approved capabilities.','Routing is not authorization.'],
    7:['Accounts Agent','Handles read-only account discovery and balance operations through approved MCP tools.','Least-privilege tool set.'],
    8:['Transaction Agent','Handles transaction history and statement capabilities through controlled tools.','No direct database access.'],
    9:['Service Agent','Handles controlled banking-service journeys and step-up controls.','High-risk updates require deterministic checks.'],
    10:['MCP Capability Layer','MCP exposes business-semantic tools rather than generic SQL or arbitrary API execution.','MCP is the controlled AI-facing interface, not the system of record.'],
    11:['FastAPI Business Services','Tools call business APIs that perform validation, authorization, workflow and system-of-record access.','Business rules are deterministic services.'],
    12:['Authorization','The backend independently verifies that the authenticated customer may access the requested resource.','Unauthorized and nonexistent resources are normalized externally.'],
    13:['System of Record','Authoritative account, transaction and workflow state lives in the database, independent from conversation memory.','Database/workflow state wins over LLM memory.'],
    14:['Observability & Audit','Each event captures trace, agent, tool, model, policy and security-decision metadata.','Create evidence without unnecessarily logging sensitive payloads.'],
    15:['Evaluation & Cost','Agent quality, safety, tool trajectory, latency, model selection and usage are measured.','Governance includes performance and cost.'],
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

  loadModels();
})();
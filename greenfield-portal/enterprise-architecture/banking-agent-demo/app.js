const config = window.RR_BANK_CONFIG || {};

const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

const sendButton =
  chatForm?.querySelector('button[type="submit"]');

const promptButtons =
  document.querySelectorAll("[data-prompt]");

const streamModeSelect =
  document.getElementById("streamMode");

let requestInProgress = false;

let streamMode =
  streamModeSelect?.value || "summary";


/* =========================================================
   CHAT
   ========================================================= */

function addMessage(role, text) {
  const message = document.createElement("div");

  message.className =
    role === "user"
      ? "message user-message"
      : "message assistant-message";

  message.textContent = text;

  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}


/* =========================================================
   DEMO FALLBACK
   ========================================================= */

function demoResponse(prompt) {
  const normalized = prompt.toLowerCase();

  if (
    normalized.includes("balance") &&
    normalized.includes("transaction")
  ) {
    return (
      "Your chequing account ending 4821 has an available balance of " +
      "$8,420.32. Your last five transactions are Payroll Deposit +$4,250.00, " +
      "Prairie Grocers -$126.47, Evergreen Utilities -$184.73, " +
      "Online Transfer -$250.00, and Riverbend Coffee -$8.75."
    );
  }

  if (
    normalized.includes("credit") &&
    normalized.includes("30")
  ) {
    return (
      "Your $30,000 credit-limit request exceeds the automated approval " +
      "threshold. I created a request for human approval. Status: PENDING_APPROVAL."
    );
  }

  if (
    normalized.includes("acc200008") ||
    normalized.includes("account 200008")
  ) {
    return "The requested account could not be accessed.";
  }

  return (
    "The governed banking runtime is currently unavailable."
  );
}

function demoPayload(prompt) {
  const normalized = prompt.toLowerCase();
  const blocked = normalized.includes("acc200008") || normalized.includes("account 200008");
  const pending = normalized.includes("credit") && normalized.includes("30");
  return {
    status: blocked ? "RESOURCE_NOT_ACCESSIBLE" : pending ? "PENDING_APPROVAL" : "SUCCESS",
    response: demoResponse(prompt),
    agent: "Governed banking assistant",
    model: "Demonstration model",
    trace_id: `DEMO-${Date.now()}`,
    execution: [
      {component:"AGENT",status:"SUCCESS"},
      {component:"MODEL",status:"SUCCESS"},
      {component:"MCP",status:blocked?"BLOCKED":pending?"PENDING_APPROVAL":"SUCCESS",tool:"Synthetic banking tool"},
      {component:"POLICY_GUARD",status:"ENFORCED",name:"Demonstration policy"}
    ]
  };
}


/* =========================================================
   BUTTON LOCKING
   ========================================================= */

function setRequestControlsDisabled(disabled) {
  requestInProgress = disabled;

  if (sendButton) {
    sendButton.disabled = disabled;

    if (disabled) {
      sendButton.dataset.originalText =
        sendButton.textContent;

      sendButton.textContent = "Processing...";
      sendButton.classList.add("is-processing");
    } else {
      sendButton.textContent =
        sendButton.dataset.originalText || "Send";

      sendButton.classList.remove("is-processing");
    }
  }

  /*
   * Also block scenario buttons while a banking
   * operation is in flight.
   */
  promptButtons.forEach(button => {
    button.disabled = disabled;
  });
}


/* =========================================================
   GOVERNANCE FOCUS
   ========================================================= */

function getGovernanceSection() {
  return (
    document.getElementById("live-governance") ||
    document.querySelector(".governance-panel")
  );
}


function focusGovernance() {
  const section = getGovernanceSection();

  if (!section) return;

  window.setTimeout(() => {
    section.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }, 200);
}


/* =========================================================
   RUNTIME STATUS
   ========================================================= */

function setRuntimeStatus(text, state) {
  const status =
    document.querySelector(".runtime-status");

  if (!status) return;

  status.innerHTML = `
    <span class="status-dot ${state || ""}"></span>
    ${escapeHtml(text)}
  `;
}


/* =========================================================
   STREAM / TRANSPARENCY CONTROL
   ========================================================= */

function applyStreamMode() {
  const governanceSection =
    getGovernanceSection();

  if (!governanceSection) return;

  governanceSection.dataset.streamMode =
    streamMode;

  governanceSection.classList.toggle(
    "stream-off",
    streamMode === "off"
  );

  const detailed =
    document.getElementById(
      "liveExecutionTrace"
    );

  if (detailed) {
    detailed.hidden =
      streamMode !== "detailed";
  }
}


if (streamModeSelect) {
  streamModeSelect.addEventListener(
    "change",
    event => {
      streamMode = event.target.value;
      applyStreamMode();
    }
  );
}


/* =========================================================
   LIVE FLOW NODES
   ========================================================= */

const FLOW_NODE_IDS = [
  "flow-user",
  "flow-agent",
  "flow-model",
  "flow-mcp",
  "flow-api",
  "flow-policy",
  "flow-hitl",
  "flow-sor"
];


function resetFlowNodes() {
  FLOW_NODE_IDS.forEach(id => {
    updateFlowNode(
      id,
      "waiting",
      null
    );
  });
}


function updateFlowNode(
  id,
  status,
  message
) {
  const node =
    document.getElementById(id);

  if (!node) return;

  const normalized =
    String(status || "waiting")
      .toLowerCase();

  node.classList.remove(
    "waiting",
    "processing",
    "success",
    "pending",
    "blocked",
    "enforced",
    "protected",
    "error"
  );

  node.classList.add(normalized);

  const statusElement =
    node.querySelector(
      ".node-status"
    );

  const messageElement =
    node.querySelector(
      ".node-message"
    );

  if (statusElement) {
    statusElement.textContent =
      normalized.toUpperCase();
  }

  if (
    messageElement &&
    message
  ) {
    messageElement.textContent =
      message;
  }
}


/* =========================================================
   REQUEST START VISUAL
   ========================================================= */

function beginExecutionVisual(prompt) {
  resetFlowNodes();

  setRuntimeStatus(
    "Live execution processing",
    "processing"
  );

  /*
   * We know the browser has submitted the request.
   * This is factual and not simulated telemetry.
   */
  updateFlowNode(
    "flow-user",
    "processing",
    "Authenticated request submitted"
  );

  /*
   * Until streaming is enabled we do NOT pretend
   * to know which backend component is executing.
   */
  updateFlowNode(
    "flow-agent",
    "processing",
    "Awaiting governed runtime execution"
  );

  focusGovernance();
}


/* =========================================================
   FINAL EXECUTION RESULT
   ========================================================= */

function applyExecutionResult(payload) {
  if (streamMode === "off") {
    return;
  }

  const execution =
    payload.execution || [];

  /*
   * User request reached the runtime.
   */
  updateFlowNode(
    "flow-user",
    "success",
    "Authenticated request accepted"
  );

  const agentEntry =
    execution.find(
      item =>
        item.component === "AGENT"
    );

  if (agentEntry) {
    updateFlowNode(
      "flow-agent",
      mapStatus(agentEntry.status),
      payload.agent ||
        "Banking agent"
    );
  } else {
    updateFlowNode(
      "flow-agent",
      "success",
      payload.agent ||
        "Banking agent"
    );
  }


  const modelEntry =
    execution.find(
      item =>
        item.component === "MODEL"
    );

  if (modelEntry) {
    updateFlowNode(
      "flow-model",
      mapStatus(modelEntry.status),
      payload.model ||
        "Gemini"
    );
  }


  const mcpEntries =
    execution.filter(
      item =>
        item.component === "MCP"
    );

  if (mcpEntries.length) {
    const blocked =
      mcpEntries.some(
        item =>
          item.status === "BLOCKED"
      );

    const pending =
      mcpEntries.some(
        item =>
          item.status ===
          "PENDING_APPROVAL"
      );

    const lastTool =
      mcpEntries[
        mcpEntries.length - 1
      ];

    updateFlowNode(
      "flow-mcp",
      blocked
        ? "blocked"
        : pending
          ? "pending"
          : "success",
      streamMode === "detailed"
        ? `Tool: ${
            lastTool.tool ||
            "governed MCP capability"
          }`
        : "Governed tool execution"
    );
  }


  /*
   * Policy guard is deterministic runtime control.
   */
  const policyEntry =
    execution.find(
      item =>
        item.component ===
        "POLICY_GUARD"
    );

  if (policyEntry) {
    updateFlowNode(
      "flow-policy",
      "enforced",
      streamMode === "detailed"
        ? policyEntry.name ||
          "Policy enforced"
        : "Runtime policy enforced"
    );
  }


  /*
   * Non-enumeration/security block.
   */
  if (
    payload.status ===
    "RESOURCE_NOT_ACCESSIBLE"
  ) {
    updateFlowNode(
      "flow-api",
      "blocked",
      "Resource access blocked"
    );

    updateFlowNode(
      "flow-sor",
      "protected",
      "Banking data protected"
    );

    return;
  }


  /*
   * Human approval / HITL.
   */
  if (
    payload.status ===
    "PENDING_APPROVAL"
  ) {
    updateFlowNode(
      "flow-api",
      "success",
      "Authorization and policy evaluated"
    );

    updateFlowNode(
      "flow-policy",
      "enforced",
      "Approval threshold enforced"
    );

    updateFlowNode(
      "flow-hitl",
      "pending",
      "Human approval required"
    );

    updateFlowNode(
      "flow-sor",
      "protected",
      "Change not executed"
    );

    return;
  }


  /*
   * Normal success.
   */
  updateFlowNode(
    "flow-api",
    "success",
    "Business API completed"
  );

  updateFlowNode(
    "flow-sor",
    "success",
    "Banking system response returned"
  );
}


function mapStatus(status) {
  switch (
    String(status || "")
      .toUpperCase()
  ) {
    case "BLOCKED":
      return "blocked";

    case "PENDING":
    case "PENDING_APPROVAL":
      return "pending";

    case "ENFORCED":
      return "enforced";

    case "ERROR":
      return "error";

    case "PROCESSING":
      return "processing";

    default:
      return "success";
  }
}


/* =========================================================
   SEND PROMPT
   ========================================================= */

async function sendPrompt(prompt) {
  if (
    requestInProgress ||
    !prompt
  ) {
    return;
  }

  addMessage(
    "user",
    prompt
  );

  setRequestControlsDisabled(true);

  beginExecutionVisual(prompt);

  try {
    /*
     * Demo fallback.
     */
    if (
      !config.runtimeEnabled ||
      !config.apiBaseUrl
    ) {
      await new Promise(resolve =>
        window.setTimeout(
          resolve,
          350
        )
      );

      const payload = demoPayload(prompt);
      applyExecutionResult(payload);
      addMessage("assistant", payload.response);

      setRuntimeStatus(
        payload.status === "PENDING_APPROVAL" ? "Human approval pending" : payload.status === "RESOURCE_NOT_ACCESSIBLE" ? "Policy control enforced" : "Controlled demonstration complete",
        payload.status === "PENDING_APPROVAL" ? "pending" : payload.status === "RESOURCE_NOT_ACCESSIBLE" ? "blocked" : "success"
      );

      return;
    }


    /*
     * LIVE GOVERNED RUNTIME
     */
    const response =
      await fetch(
        `${config.apiBaseUrl}/api/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            message: prompt,
            model: config.model,
            transparency_mode:
              streamMode
          })
        }
      );


    if (!response.ok) {
      throw new Error(
        `Runtime returned ${response.status}`
      );
    }


    const payload =
      await response.json();


    /*
     * Apply governance visualization
     * before returning focus to the
     * assistant response.
     */
    applyExecutionResult(payload);


    if (
      streamMode === "detailed"
    ) {
      renderExecutionTrace(payload);
    }


    addMessage(
      "assistant",
      payload.response ||
        payload.message ||
        "The request completed."
    );


    const successful =
      payload.status === "SUCCESS";

    const pending =
      payload.status ===
      "PENDING_APPROVAL";

    const blocked =
      payload.status ===
      "RESOURCE_NOT_ACCESSIBLE";


    if (successful) {
      setRuntimeStatus(
        "Live execution complete",
        "success"
      );
    } else if (pending) {
      setRuntimeStatus(
        "Human approval pending",
        "pending"
      );
    } else if (blocked) {
      setRuntimeStatus(
        "Policy control enforced",
        "blocked"
      );
    } else {
      setRuntimeStatus(
        payload.status ||
          "Execution complete",
        "success"
      );
    }

  } catch (error) {
    console.error(error);

    setRuntimeStatus(
      "Runtime unavailable",
      "error"
    );

    updateFlowNode(
      "flow-agent",
      "error",
      "Runtime communication failed"
    );

    addMessage(
      "assistant",
      "The governed banking runtime is currently unavailable. No banking action was executed."
    );

  } finally {
    /*
     * Always restore controls.
     */
    setRequestControlsDisabled(false);
  }
}


/* =========================================================
   EXISTING DETAILED TRACE
   ========================================================= */

function renderExecutionTrace(payload) {
  const panel =
    document.querySelector(
      ".governance-panel"
    );

  if (!panel) return;

  let container =
    document.getElementById(
      "liveExecutionTrace"
    );

  if (!container) {
    container =
      document.createElement("div");

    container.id =
      "liveExecutionTrace";

    container.className =
      "live-trace";

    panel.appendChild(container);
  }

  const execution =
    payload.execution || [];


  const toolRows =
    execution
      .filter(
        item =>
          item.component === "MCP"
      )
      .map(item => {
        const tool =
          item.tool ||
          "MCP Tool";

        const status =
          item.status ||
          "UNKNOWN";

        return `
          <div class="trace-row">

            <span class="trace-component">
              MCP
            </span>

            <span class="trace-name">
              ${escapeHtml(tool)}
            </span>

            <span class="trace-state ${status.toLowerCase()}">
              ${escapeHtml(status)}
            </span>

          </div>
        `;
      })
      .join("");


  container.innerHTML = `

    <div class="live-trace-header">

      <div>
        <div class="eyebrow">
          Sanitized Runtime Trace
        </div>

        <h3>
          Governed agent execution
        </h3>
      </div>

      <div class="trace-id">
        <span>TRACE ID</span>

        <strong>
          ${escapeHtml(
            payload.trace_id ||
              "—"
          )}
        </strong>
      </div>

    </div>


    <div class="trace-row">

      <span class="trace-component">
        AGENT
      </span>

      <span class="trace-name">
        ${escapeHtml(
          payload.agent ||
            "accounts_agent"
        )}
      </span>

      <span class="trace-state success">
        SUCCESS
      </span>

    </div>


    <div class="trace-row">

      <span class="trace-component">
        MODEL
      </span>

      <span class="trace-name">
        ${escapeHtml(
          payload.model ||
            "Gemini"
        )}
      </span>

      <span class="trace-state success">
        SUCCESS
      </span>

    </div>


    ${toolRows}


    <div class="trace-meta">

      <div>
        <span>Customer</span>
        <strong>
          ${escapeHtml(
            payload.customer_id ||
              "—"
          )}
        </strong>
      </div>

      <div>
        <span>Session</span>
        <strong>
          ${escapeHtml(
            payload.session_id ||
              "—"
          )}
        </strong>
      </div>

      <div>
        <span>Policy</span>
        <strong>
          Fail Closed
        </strong>
      </div>

      <div>
        <span>Exposure</span>
        <strong>
          Sanitized
        </strong>
      </div>

    </div>
  `;

  container.hidden =
    streamMode !== "detailed";
}


/* =========================================================
   BASIC OUTPUT ENCODING
   ========================================================= */

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================================
   FORM EVENTS
   ========================================================= */

chatForm?.addEventListener(
  "submit",
  event => {
    event.preventDefault();

    if (requestInProgress) {
      return;
    }

    const prompt =
      chatInput.value.trim();

    if (!prompt) {
      return;
    }

    chatInput.value = "";

    sendPrompt(prompt);
  }
);


/* =========================================================
   SCENARIO BUTTONS
   ========================================================= */

promptButtons.forEach(button => {
  button.addEventListener(
    "click",
    () => {
      if (requestInProgress) {
        return;
      }

      sendPrompt(
        button.dataset.prompt
      );
    }
  );
});


/* =========================================================
   INITIAL STATE
   ========================================================= */

applyStreamMode();
resetFlowNodes();

document.querySelectorAll(".account-row").forEach(row=>row.addEventListener("click",()=>{
  document.querySelectorAll(".account-row").forEach(item=>item.classList.remove("active"));
  row.classList.add("active");
}));
document.querySelectorAll(".text-button").forEach(button=>button.addEventListener("click",()=>setRuntimeStatus(`${button.textContent.trim()} opened in this guided prototype`,"success")));
document.querySelectorAll(".bank-nav a").forEach(link=>link.addEventListener("click",event=>{event.preventDefault();setRuntimeStatus(`${link.textContent.trim()} selected`,"success")}));

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS knowledge_objects (
  id TEXT PRIMARY KEY,
  canonical_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  acronym TEXT,
  full_form TEXT,
  aliases_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(aliases_json)),
  object_type TEXT NOT NULL CHECK (object_type IN (
    'concept','architecture','control','implementation','faq','concern',
    'decision','vendor_capability','visual_story','article'
  )),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','deprecated','planned')),
  version TEXT NOT NULL DEFAULT '1.0',
  owner TEXT,
  reviewer TEXT,
  one_line_definition TEXT NOT NULL,
  plain_language_explanation TEXT NOT NULL,
  executive_summary TEXT,
  technical_explanation TEXT,
  business_value TEXT,
  architecture_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(architecture_json)),
  governance_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(governance_json)),
  security_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(security_json)),
  implementation_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(implementation_json)),
  operations_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(operations_json)),
  risk_quality_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(risk_quality_json)),
  learning_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(learning_json)),
  search_keywords TEXT NOT NULL DEFAULT '',
  audience_levels_json TEXT NOT NULL DEFAULT '["executive","practitioner","technical"]' CHECK (json_valid(audience_levels_json)),
  source_path TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_reviewed_at TEXT,
  next_review_at TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id TEXT NOT NULL REFERENCES knowledge_objects(id) ON DELETE CASCADE,
  target_id TEXT NOT NULL REFERENCES knowledge_objects(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'depends_on','required_by','implements','governed_by','secured_by','monitored_by',
    'tested_by','mitigates','introduces_risk','alternative_to','integrates_with',
    'part_of','used_by','supersedes','deprecated_by','explained_by','visualised_by',
    'referenced_by','affected_by','priced_by','supported_by_vendor','requires_approval',
    'requires_evidence'
  )),
  description TEXT,
  evidence_id INTEGER REFERENCES knowledge_evidence(id) ON DELETE SET NULL,
  confidence TEXT NOT NULL DEFAULT 'medium' CHECK (confidence IN ('low','medium','high')),
  valid_from TEXT,
  valid_to TEXT,
  version TEXT NOT NULL DEFAULT '1.0',
  review_status TEXT NOT NULL DEFAULT 'unreviewed' CHECK (review_status IN ('unreviewed','reviewed','needs_review')),
  UNIQUE(source_id,target_id,relationship_type)
);

CREATE TABLE IF NOT EXISTS knowledge_evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  object_id TEXT NOT NULL REFERENCES knowledge_objects(id) ON DELETE CASCADE,
  source_title TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_url TEXT,
  publisher TEXT,
  publication_date TEXT,
  accessed_date TEXT,
  applicable_version TEXT,
  claim_supported TEXT NOT NULL,
  reliability TEXT NOT NULL DEFAULT 'platform_reviewed' CHECK (reliability IN (
    'primary','authoritative','vendor_claim','published_research','industry_practice',
    'platform_recommendation','platform_reviewed','unverified'
  )),
  notes TEXT,
  review_at TEXT
);

CREATE TABLE IF NOT EXISTS knowledge_search_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT NOT NULL,
  result_ids_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(result_ids_json)),
  helpful INTEGER CHECK (helpful IN (0,1)),
  comment TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_knowledge_public
  ON knowledge_objects(status, object_type, canonical_name);
CREATE INDEX IF NOT EXISTS idx_knowledge_relationship_source
  ON knowledge_relationships(source_id, relationship_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_relationship_target
  ON knowledge_relationships(target_id, relationship_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_evidence_object
  ON knowledge_evidence(object_id);

INSERT OR IGNORE INTO knowledge_objects
  (id,canonical_name,slug,acronym,full_form,aliases_json,object_type,status,one_line_definition,
   plain_language_explanation,executive_summary,technical_explanation,business_value,
   implementation_json,operations_json,risk_quality_json,learning_json,search_keywords,source_path)
VALUES
('concept-ai-gateway','AI Gateway','ai-gateway',NULL,NULL,'["model gateway","LLM gateway"]','concept','published',
 'A controlled entry point that routes and governs requests to approved AI services.',
 'An AI Gateway is the front door for enterprise AI traffic. It applies common identity, policy, routing, safety, logging, and cost controls before a request reaches a model.',
 'Use a gateway when controls must remain consistent across applications and model providers.',
 'A gateway exposes stable APIs and applies authentication, authorization, policy evaluation, model routing, rate limits, content controls, telemetry, and failure handling.',
 'Reduces duplicated controls and makes provider changes easier to govern.',
 '{"status":"partial","steps":["Define approved routes","Enforce identity and policy","Add request and response validation","Capture audit evidence"],"testing":["Unauthorized routes are denied","Provider failover preserves policy"]}',
 '{"monitoring":["request volume","latency","blocked requests","provider errors"],"owner":"AI platform operations"}',
 '{"failure_modes":["gateway outage","policy misconfiguration","provider timeout"],"production_readiness":["deny by default","tested failover","auditable decisions"]}',
 '{"related":["concept-rag","control-human-approval"],"audience_path":["executive","practitioner","technical"]}',
 'gateway model router policy enforcement control plane LLM routing',
 '/pages/ai-architecture.html'),
('concept-rag','Retrieval-Augmented Generation','retrieval-augmented-generation','RAG','Retrieval-Augmented Generation','["grounded generation","retrieval augmented generation"]','concept','published',
 'A pattern that retrieves approved information and gives it to a model as context for an answer.',
 'RAG helps an AI answer from selected enterprise sources without retraining the model. Retrieval permissions and citations are essential controls.',
 'Choose RAG when answers must use current, attributable knowledge.',
 'A retrieval pipeline resolves identity, searches authorized chunks, ranks results, builds bounded context, generates an answer, and validates citations.',
 'Improves access to current knowledge while retaining source traceability.',
 '{"status":"partial","steps":["Classify sources","Preserve access controls","Chunk and index content","Retrieve with identity filters","Validate citations"],"testing":["restricted chunks never cross identities","citations resolve to source versions"]}',
 '{"monitoring":["retrieval quality","citation coverage","index freshness","authorization denials"],"owner":"Knowledge platform operations"}',
 '{"failure_modes":["stale index","retrieval leakage","unsupported answer"],"production_readiness":["deletion propagation","version awareness","grounding threshold"]}',
 '{"related":["concept-vector-database","concept-embedding-model"],"audience_path":["executive","practitioner","technical"]}',
 'RAG retrieval grounding citations knowledge search documents',
 '/pages/data-security.html'),
('concept-vector-database','Vector Database','vector-database',NULL,NULL,'["vector store","embedding index"]','concept','published',
 'A data store optimized for finding items with mathematically similar representations.',
 'A vector database finds content with similar meaning. Enterprise use also requires metadata filters, tenant isolation, lifecycle controls, backup, and deletion.',
 'Treat the vector index as governed derived data, not as a disposable cache.',
 'The store indexes embedding vectors and metadata, executes nearest-neighbour retrieval, and applies authorization filters before returning chunks.',
 'Enables semantic retrieval across large knowledge collections.',
 '{"status":"partial","steps":["Choose isolation model","Define metadata schema","Configure backup and deletion","Test authorization filters"]}',
 '{"monitoring":["query latency","recall","index lag","capacity"],"owner":"Data platform operations"}',
 '{"failure_modes":["cross-tenant retrieval","embedding incompatibility","index corruption"],"production_readiness":["restore test","deletion test","capacity plan"]}',
 '{"related":["concept-rag","concept-embedding-model"]}',
 'vector database vector store semantic search nearest neighbor embeddings',
 '/pages/data-security.html'),
('concept-embedding-model','Embedding Model','embedding-model',NULL,NULL,'["embedding service","text encoder"]','concept','published',
 'A model that converts content into numeric representations used for similarity comparison.',
 'Embedding models turn text or other content into vectors so related items can be found. Changing models normally requires re-embedding and re-indexing.',
 'Select and version embedding models as managed architecture dependencies.',
 'The model maps input into a fixed-dimensional vector space whose similarity function is used by retrieval systems.',
 'Supports semantic discovery across different wording and terminology.',
 '{"status":"partial","steps":["Evaluate domain retrieval quality","Record model and version","Plan re-indexing","Protect source data"]}',
 '{"monitoring":["embedding failures","throughput","version distribution"],"owner":"AI platform operations"}',
 '{"failure_modes":["model drift","dimension mismatch","data exposure"],"production_readiness":["version pinning","migration plan","quality baseline"]}',
 '{"related":["concept-vector-database","concept-rag"]}',
 'embeddings encoder vectors semantic similarity model',
 '/pages/ai-technology-glossary.html#embeddings'),
('concept-ai-agent','AI Agent','ai-agent',NULL,NULL,'["agentic AI system","autonomous agent"]','concept','published',
 'An AI-enabled system that can plan or select actions and use tools to pursue a goal.',
 'An AI agent can do more than answer: it may choose steps and act through tools. Its permissions, boundaries, approval points, and stop controls must be explicit.',
 'Increase autonomy only when control strength, observability, and reversibility support it.',
 'An agent combines a model runtime with instructions, state, planning, tools, authorization, policy evaluation, evaluation, and audit telemetry.',
 'Can coordinate multi-step work while reducing manual hand-offs.',
 '{"status":"partial","steps":["Bound goals","Minimize tool permissions","Add approval gates","Test failure and stop paths"]}',
 '{"monitoring":["tool calls","policy denials","loop depth","human overrides"],"owner":"Application and AI operations"}',
 '{"failure_modes":["runaway loop","excessive agency","unsafe tool call"],"production_readiness":["kill switch","spend limit","traceable actions"]}',
 '{"related":["control-human-approval","concept-mcp"]}',
 'agent agentic autonomous tools planning workflow',
 '/pages/agentic-ai.html'),
('concept-mcp','Model Context Protocol','model-context-protocol','MCP','Model Context Protocol','["MCP server","MCP client"]','concept','published',
 'A protocol for connecting AI applications to tools and contextual data through defined interfaces.',
 'MCP standardizes how an AI application discovers and calls external capabilities. The protocol does not replace identity, authorization, input validation, or audit controls.',
 'Treat each MCP server as an external integration and trust boundary.',
 'MCP defines client-server messages for capabilities such as tools, resources, and prompts; enterprise deployments wrap these interactions with policy enforcement.',
 'Reduces bespoke integration while preserving a consistent connection model.',
 '{"status":"partial","steps":["Inventory servers","Authorize every tool","Validate arguments and results","Log calls","Test unavailable dependencies"]}',
 '{"monitoring":["server availability","tool errors","denied calls","latency"],"owner":"Integration platform operations"}',
 '{"failure_modes":["untrusted server","tool confusion","privilege escalation"],"production_readiness":["allowlist","scoped identity","audit trail"]}',
 '{"related":["concept-ai-agent","concept-ai-gateway"]}',
 'MCP model context protocol tools resources server client integration',
 '/pages/ai-technology-glossary.html#model-context-protocol'),
('control-human-approval','Human Approval','human-approval','HITL','Human in the Loop','["human review","four-eyes approval"]','control','published',
 'A control that requires an authorized person to review or approve an AI output or action.',
 'Human approval is a decision gate, not a person merely watching the process. The reviewer needs context, authority, time, and a way to reject or correct the result.',
 'Require approval when impact, uncertainty, irreversibility, or regulation exceeds the approved automation boundary.',
 'The runtime pauses execution, packages evidence and rationale, assigns an authorized reviewer, records the decision, and resumes or rejects the action.',
 'Keeps accountable decisions with people where risk requires it.',
 '{"status":"partial","steps":["Define trigger rules","Assign decision rights","Present evidence","Record decision","Test timeout and rejection"]}',
 '{"monitoring":["approval volume","wait time","override rate","expired requests"],"owner":"Business control owner"}',
 '{"failure_modes":["rubber stamping","approval bypass","orphaned request"],"production_readiness":["segregation of duties","timeout path","immutable decision record"]}',
 '{"related":["concept-ai-agent","concept-ai-gateway"]}',
 'HITL human in the loop approval review escalation decision gate',
 '/pages/ai-architecture.html'),
('concept-prompt-guardrail','Prompt Guardrail','prompt-guardrail',NULL,NULL,'["input guardrail","prompt safety control"]','control','published',
 'A runtime control that inspects or constrains instructions and context before model execution.',
 'Prompt guardrails reduce unsafe or disallowed requests, but they are one layer in a wider control system and are not a security boundary by themselves.',
 'Combine prompt controls with identity, authorization, data controls, output validation, and monitoring.',
 'Guardrails classify inputs, detect known attack patterns, enforce length and schema rules, and route uncertain cases to block or review outcomes.',
 'Provides consistent safety checks close to model execution.',
 '{"status":"partial","steps":["Define policies","Select detection layers","Set fail behavior","Evaluate bypass attempts"]}',
 '{"monitoring":["blocked prompts","false positives","bypass tests"],"owner":"AI security operations"}',
 '{"failure_modes":["evasion","overblocking","silent failure"],"production_readiness":["layered controls","red-team tests","versioned policies"]}',
 '{"related":["concept-ai-gateway","control-human-approval"]}',
 'guardrail prompt injection input filter safety policy',
 '/pages/ai-architecture.html');

INSERT OR IGNORE INTO knowledge_relationships
  (source_id,target_id,relationship_type,description,confidence,review_status)
VALUES
('concept-rag','concept-vector-database','depends_on','Typical RAG implementations use a vector index for semantic retrieval.','high','reviewed'),
('concept-rag','concept-embedding-model','depends_on','Semantic retrieval depends on a versioned embedding model.','high','reviewed'),
('concept-ai-agent','control-human-approval','governed_by','Higher-impact agent actions require an explicit approval gate.','high','reviewed'),
('concept-ai-agent','concept-mcp','integrates_with','Agents may use MCP to access approved tools and resources.','medium','reviewed'),
('concept-ai-gateway','concept-prompt-guardrail','secured_by','A gateway can apply prompt controls before routing.','high','reviewed'),
('concept-ai-gateway','control-human-approval','requires_approval','Gateway policy may pause a request for an authorized reviewer.','high','reviewed');

INSERT OR IGNORE INTO menu_items(label,url,parent_id,position,visibility)
SELECT 'Knowledge Discovery','/pages/knowledge-discovery.html',NULL,5,'visible'
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE url='/pages/knowledge-discovery.html');

INSERT OR IGNORE INTO page_access(path,title,visibility,requires_sign_in)
VALUES('/pages/knowledge-discovery.html','Knowledge Discovery','visible',0);

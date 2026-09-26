# Deployment notes

This prototype is intentionally local and was not deployed to `ai.rrlabs.ca`.

For a controlled non-production environment, package the static root (`index.html` plus `frontend/`) under `/enterprise-architecture/incentive-commission-demo/` and run the FastAPI service behind a private API gateway. Configure explicit CORS origins, managed secrets, durable token storage with encryption and TTLs, enterprise identity, immutable log storage, malware scanning, Vectorize, Workers AI embeddings, Gemini credentials, and deny-by-default network egress.

Production promotion requires threat modelling, privacy and model-risk approval, load and recovery testing, key rotation, artifact signing, infrastructure-as-code review, and a separately authorized deployment change.

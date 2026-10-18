---
title: Quick Start
description: Get from zero to sending email in under 2 minutes.
---

## Start the server

```bash
docker run -d \
  -p 3891:3891 \
  -e PIGEONS_AWS_ACCESS_KEY_ID=your-key \
  -e PIGEONS_AWS_SECRET_ACCESS_KEY=your-secret \
  -e PIGEONS_AWS_REGION=us-east-1 \
  -e PIGEONS_FROM_EMAIL=noreply@yourdomain.com \
  ghcr.io/pigeons-dev/pigeons
```

On first boot, Pigeons prints your API key to stdout. Grab it from the logs:

```bash
docker logs $(docker ps -q --filter ancestor=ghcr.io/pigeons-dev/pigeons) 2>&1 | grep "Your API key"
```

The key starts with `pgn_`. Save it somewhere safe - it won't be shown again.

## Send your first email

```bash
curl -X POST http://localhost:3891/v1/emails \
  -H "Content-Type: application/json" \
  -H "x-api-key: pgn_your_key_here" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Hello from Pigeons",
    "html": "<h1>It works!</h1>"
  }'
```

Response:

```json
{
  "id": "msg_abc123...",
  "status": "queued",
  "from": "noreply@yourdomain.com",
  "to": ["recipient@example.com"],
  "subject": "Hello from Pigeons"
}
```

## Install the SDK

### TypeScript

```bash
npm install @pigeons/pigeons-ts
```

```typescript
import { Pigeons } from '@pigeons/pigeons-ts'

const pigeons = new Pigeons({
  baseUrl: 'http://localhost:3891',
  apiKey: 'pgn_your_key_here',
})

const email = await pigeons.emails.send({
  to: 'recipient@example.com',
  subject: 'Hello from Pigeons',
  html: '<h1>It works!</h1>',
})

console.log(email.id) // msg_abc123...
```

### Python

```bash
pip install pigeons-py
```

```python
from pigeons import Pigeons

pigeons = Pigeons(
    base_url="http://localhost:3891",
    api_key="pgn_your_key_here",
)

email = pigeons.emails.send(
    to="recipient@example.com",
    subject="Hello from Pigeons",
    html="<h1>It works!</h1>",
)

print(email.id)  # msg_abc123...
```

## What's next

- [Self-Hosting](/docs/self-hosting) - production deployment with Docker, environment variables, and HTTPS
- [Domains](/docs/domains) - add and verify a sending domain
- [API Reference](/docs/api-reference) - full endpoint documentation
- [TypeScript SDK](/docs/typescript-sdk) - complete SDK guide

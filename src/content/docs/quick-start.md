# Quick Start

Pigeons is open source email infrastructure you run on your own server. It handles transactional email, inbound webhooks, campaigns, contacts, and gives AI agents an inbox through an MCP server. Everything runs in a single Docker container backed by SQLite and AWS SES.

Source code: [github.com/pigeons-dev/pigeons](https://github.com/pigeons-dev/pigeons)

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- An AWS account with SES access
- AWS credentials (access key ID and secret access key) with `ses:SendEmail` and `ses:SendRawEmail` permissions
- A verified sending domain or email address in SES (see [Domains](/docs/domains/) for setup)

If your SES account is still in sandbox mode, you can only send to verified addresses. You can test with SES simulator addresses like `success@simulator.amazonses.com`.

## Run the server

Pull and start the container:

```bash
docker run -d \
  --name pigeons \
  -p 3891:3891 \
  -v pigeons-data:/data \
  -e PIGEONS_DATABASE_URL=file:/data/pigeons.db \
  -e PIGEONS_AWS_ACCESS_KEY_ID=your-key \
  -e PIGEONS_AWS_SECRET_ACCESS_KEY=your-secret \
  -e PIGEONS_AWS_REGION=us-east-1 \
  -e PIGEONS_FROM_EMAIL=noreply@yourdomain.com \
  ghcr.io/pigeons-dev/pigeons
```

On first boot, Pigeons runs database migrations and generates an API key. Grab it from the logs:

```bash
docker logs pigeons 2>&1 | grep "Your API key"
```

The key starts with `pgn_`. Save it somewhere safe - it is only printed once.

Verify the server is running:

```bash
curl http://localhost:3891/health
```

You should see `{"status":"ok"}`.

## Send your first email

Use curl to send a test email:

```bash
curl -X POST http://localhost:3891/v1/emails \
  -H "Content-Type: application/json" \
  -H "x-api-key: pgn_your_key_here" \
  -d '{
    "to": "success@simulator.amazonses.com",
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
  "to": ["success@simulator.amazonses.com"],
  "subject": "Hello from Pigeons"
}
```

The email is queued and sent through SES within seconds. Check the status:

```bash
curl http://localhost:3891/v1/emails/msg_abc123... \
  -H "x-api-key: pgn_your_key_here"
```

## Install an SDK

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
  to: 'success@simulator.amazonses.com',
  subject: 'Hello from Pigeons',
  html: '<h1>It works!</h1>',
})

console.log(email.id)     // msg_abc123...
console.log(email.status) // "queued"
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
    to="success@simulator.amazonses.com",
    subject="Hello from Pigeons",
    html="<h1>It works!</h1>",
)

print(email.id)     # msg_abc123...
print(email.status) # "queued"
```

### CLI

```bash
npx @pigeons/cli login --url http://localhost:3891 --api-key pgn_your_key_here
npx @pigeons/cli send --to success@simulator.amazonses.com --subject "Hello" --html "<h1>It works!</h1>"
```

## Run from source

If you want to develop locally or contribute:

```bash
git clone https://github.com/pigeons-dev/pigeons.git
cd pigeons
pnpm install
pnpm build
```

Start the development server:

```bash
pnpm --filter @pigeons/core dev
```

This starts the server on `http://localhost:3891` with hot reload. You still need the AWS environment variables set in `packages/core/.env`.

## What's next

Now that you have Pigeons running and can send email, here is the recommended path:

1. [Self-Hosting](/docs/self-hosting/) - production deployment with Docker Compose, HTTPS, and persistent storage
2. [Domains](/docs/domains/) - add and verify a sending domain for proper deliverability
3. [Templates](/docs/templates/) - create reusable email templates with variables
4. [TypeScript SDK](/docs/typescript-sdk/) or [Python SDK](/docs/python-sdk/) - full SDK reference
5. [API Reference](/docs/api-reference/) - complete endpoint documentation

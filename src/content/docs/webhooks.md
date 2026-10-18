# Webhooks

## Overview

Webhooks deliver real-time notifications when events happen in your Pigeons instance. When an event fires, Pigeons sends a POST request to each registered webhook that subscribes to that event type.

## Event Types

| Event | Fires when |
|---|---|
| `email.sent` | An email is accepted by SES |
| `email.delivered` | SES confirms delivery to the recipient |
| `email.bounced` | SES reports a bounce |
| `email.complained` | SES reports a spam complaint |
| `email.opened` | A recipient opens an email (requires open tracking) |
| `email.failed` | An email fails to send |
| `inbox.message.received` | An inbound email arrives at an inbox |
| `inbox.message.sent` | An outbound email is sent from an inbox |
| `contact.created` | A new contact is created |
| `contact.updated` | A contact is updated |
| `contact.unsubscribed` | A contact unsubscribes |
| `campaign.sent` | A campaign email is sent |
| `campaign.completed` | A campaign finishes sending to all recipients |
| `sequence.step.sent` | A sequence step email is sent |

## Create a Webhook

```bash
curl -X POST http://localhost:3891/v1/webhooks \
  -H "x-api-key: pgn_..." \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhooks/pigeons",
    "events": ["email.delivered", "email.bounced", "inbox.message.received"]
  }'
```

```typescript
const webhook = await pigeons.webhooks.create({
  url: 'https://your-app.com/webhooks/pigeons',
  events: ['email.delivered', 'email.bounced', 'inbox.message.received'],
})

console.log(webhook.secret) // "whsec_..."  -  only returned on creation
```

A signing secret is auto-generated if you don't provide one (minimum 16 characters). The secret is only returned in the create response. Store it securely.

## Payload Format

Every webhook delivery is a POST request with a JSON body:

```json
{
  "event": "email.delivered",
  "data": {
    "email_id": "msg_abc123...",
    "delivered_at": "2024-01-15T10:30:05.000Z"
  }
}
```

### Headers

| Header | Description |
|---|---|
| `Content-Type` | `application/json` |
| `X-Pigeons-Signature` | HMAC-SHA256 signature of the request body |
| `X-Pigeons-Event` | Event type (e.g. `email.delivered`) |
| `X-Pigeons-Delivery` | Unique delivery ID (`wdl_...`) |

### Example payloads

**email.delivered:**

```json
{
  "event": "email.delivered",
  "data": {
    "email_id": "msg_abc123...",
    "delivered_at": "2024-01-15T10:30:05.000Z"
  }
}
```

**email.bounced:**

```json
{
  "event": "email.bounced",
  "data": {
    "email_id": "msg_abc123...",
    "bounce_type": "Permanent",
    "bounced_at": "2024-01-15T10:30:05.000Z"
  }
}
```

**inbox.message.received:**

```json
{
  "event": "inbox.message.received",
  "data": {
    "inbox_id": "inb_abc123...",
    "message_id": "imsg_xyz789...",
    "thread_id": "thr_def456...",
    "from": "customer@example.com",
    "to": ["support@yourdomain.com"],
    "subject": "Help with my order",
    "text": "I need help with order #123...",
    "direction": "inbound"
  }
}
```

**email.opened:**

```json
{
  "event": "email.opened",
  "data": {
    "email_id": "msg_abc123...",
    "opened_at": "2024-01-15T14:22:00.000Z"
  }
}
```

## Signature Verification

Every delivery is signed with your webhook's secret using HMAC-SHA256. Verify signatures to ensure requests come from your Pigeons instance.

### Node.js

```typescript
import { createHmac } from 'crypto'

function verifySignature(body: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(body).digest('hex')
  return expected === signature
}

// In your webhook handler:
app.post('/webhooks/pigeons', (req, res) => {
  const signature = req.headers['x-pigeons-signature'] as string
  const rawBody = JSON.stringify(req.body)

  if (!verifySignature(rawBody, signature, 'whsec_your_secret')) {
    return res.status(401).send('Invalid signature')
  }

  // Process the event
  const { event, data } = req.body
  console.log(`Received ${event}:`, data)

  res.status(200).send('ok')
})
```

### Python

```python
import hmac
import hashlib

def verify_signature(body: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(
        secret.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
```

## Retry Policy

Failed deliveries are retried with exponential backoff:

| Attempt | Delay |
|---|---|
| 1 | Immediate |
| 2 | 1 minute |
| 3 | 5 minutes |
| 4 (final) | 15 minutes |

A delivery is considered failed if:

- The endpoint returns a non-2xx status code
- The request times out (10 second timeout)
- The connection fails

After 3 retry attempts, the delivery is abandoned.

### Auto-disable

After 10 consecutive failures across any deliveries, the webhook is automatically disabled (status set to `disabled`). Re-enable it by updating the webhook:

```bash
curl -X PATCH http://localhost:3891/v1/webhooks/whk_abc123... \
  -H "x-api-key: pgn_..." \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'
```

## Manage Webhooks

### List

```bash
curl http://localhost:3891/v1/webhooks -H "x-api-key: pgn_..."
```

The list response does not include secrets.

### Update

```bash
curl -X PATCH http://localhost:3891/v1/webhooks/whk_abc123... \
  -H "x-api-key: pgn_..." \
  -H "Content-Type: application/json" \
  -d '{"events": ["email.delivered", "email.bounced", "email.complained"]}'
```

### Delete

```bash
curl -X DELETE http://localhost:3891/v1/webhooks/whk_abc123... \
  -H "x-api-key: pgn_..."
```

## SSRF Protection

Webhook URLs are validated before every delivery to prevent SSRF attacks. URLs pointing to private IP ranges, localhost, or link-local addresses are rejected.

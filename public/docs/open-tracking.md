---
title: Open Tracking
description: Track email opens with a transparent tracking pixel.
---

## How It Works

When open tracking is enabled, Pigeons injects a 1x1 transparent GIF pixel into the HTML body of outgoing emails, just before the closing `</body>` tag:

```html
<img src="https://pigeons.yourdomain.com/v1/t/msg_abc123..."
     alt="" width="1" height="1"
     style="display:none!important;width:1px!important;height:1px!important" />
```

When the recipient's email client loads the image, Pigeons records the open. The pixel endpoint returns the image immediately and processes the open asynchronously, so tracking never delays the response.

## Enabling Open Tracking

Open tracking is **off by default**. Two controls determine whether an email gets a tracking pixel:

### Global: `PIGEONS_OPEN_TRACKING`

Set the environment variable to enable tracking for all emails:

```bash
PIGEONS_OPEN_TRACKING=true
PIGEONS_BASE_URL=https://pigeons.yourdomain.com  # required for pixel URLs
```

Both variables are required. Without `PIGEONS_BASE_URL`, pixels cannot be injected because there is no URL to point them to.

### Per-email: `trackOpens`

Override the global setting for individual emails:

```bash
curl -X POST http://localhost:3891/v1/emails \
  -H "x-api-key: pgn_..." \
  -H "Content-Type: application/json" \
  -d '{
    "to": "alice@example.com",
    "subject": "Your invoice",
    "html": "<h1>Invoice #123</h1>",
    "trackOpens": true
  }'
```

```typescript
const email = await pigeons.emails.send({
  to: 'alice@example.com',
  subject: 'Your invoice',
  html: '<h1>Invoice #123</h1>',
  trackOpens: true,
})
```

The resolution order:

1. If `trackOpens` is explicitly set on the email, use that value
2. Otherwise, use the global `PIGEONS_OPEN_TRACKING` setting
3. Default is `false`

## Open Data

When an email is opened, Pigeons updates these fields on the email record:

| Field | Description |
|---|---|
| `openCount` | Total number of times the pixel was loaded |
| `firstOpenedAt` | Timestamp of the first open |
| `lastOpenedAt` | Timestamp of the most recent open |

```typescript
const email = await pigeons.emails.get('msg_abc123...')
console.log(email.openCount)     // 3
console.log(email.firstOpenedAt) // "2024-01-15T10:45:00.000Z"
console.log(email.lastOpenedAt)  // "2024-01-16T08:12:00.000Z"
```

## Webhook Event

The first time an email is opened, Pigeons fires the `email.opened` webhook event:

```json
{
  "event": "email.opened",
  "data": {
    "email_id": "msg_abc123...",
    "opened_at": "2024-01-15T10:45:00.000Z"
  }
}
```

The webhook fires only on the first open, not on subsequent opens of the same email.

## Campaign and Sequence Stats

Open tracking integrates with campaign and sequence statistics:

- **Campaigns**: The `stats.opened` counter increments when a campaign email is first opened
- **Sequences**: Each email step has its own `stats.opened` counter

```json
{
  "stats": {
    "total": 500,
    "sent": 450,
    "delivered": 440,
    "opened": 120,
    "bounced": 5,
    "complained": 1,
    "failed": 4
  }
}
```

## Privacy Considerations

Tracking pixels are a common industry practice, but they raise privacy concerns:

- **Accuracy**: Email clients that block remote images will not trigger opens. Apple Mail Privacy Protection pre-fetches images, which can inflate open counts. Open rates are a directional metric, not an exact count.

- **Transparency**: Consider disclosing tracking in your privacy policy. Some jurisdictions require it.

- **Opt-out**: Use the per-email `trackOpens: false` override to skip tracking for specific emails (e.g. transactional receipts where tracking is inappropriate).

- **Default off**: Pigeons defaults to tracking disabled globally. Enable it deliberately when you need the data.

## Tracking Pixel Endpoint

```
GET /v1/t/:emailId
```

This endpoint is unauthenticated (no API key required) and returns a 1x1 transparent GIF with aggressive no-cache headers. It is designed to be embedded in emails and loaded by email clients.

The endpoint responds immediately with the pixel image. Open recording happens asynchronously after the response is sent, so any failures in recording do not affect the pixel response.

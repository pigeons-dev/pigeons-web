---
title: API Reference
description: Complete REST API documentation for every Pigeons endpoint.
---

## Overview

Base path: `/v1`

All authenticated endpoints require the `x-api-key` header. API keys start with `pgn_`.

```bash
curl http://localhost:3891/v1/emails \
  -H "x-api-key: pgn_your_key_here"
```

### Pagination

List endpoints use cursor-based pagination:

```json
{
  "data": [...],
  "has_more": true,
  "next_cursor": "2024-01-15T10:30:00.000Z"
}
```

Pass `?cursor=<next_cursor>&limit=25` to get the next page. Maximum limit is 100, default is 25.

### Idempotency

Mutating endpoints accept an `Idempotency-Key` header. If the same key is sent again within 24 hours, the original response is returned without re-executing the request.

```bash
curl -X POST http://localhost:3891/v1/emails \
  -H "x-api-key: pgn_..." \
  -H "Idempotency-Key: my-unique-key-123" \
  -H "Content-Type: application/json" \
  -d '{"to": "user@example.com", "subject": "Hello", "text": "Hi"}'
```

### Error format

All errors return a consistent JSON shape:

```json
{
  "error": {
    "type": "validation_error",
    "message": "Subject is required",
    "code": "validation_error"
  }
}
```

| Status | Type | Meaning |
|---|---|---|
| 400 | `validation_error` | Invalid request body or parameters |
| 401 | `authentication_error` | Missing or invalid API key |
| 404 | `not_found` | Resource does not exist |
| 409 | `conflict` | Resource already exists (e.g. duplicate email) |
| 429 | `rate_limit_error` | Too many requests |
| 500 | `internal_error` | Unexpected server error |

---

## Emails

### Send an email

```
POST /v1/emails
```

Send directly with HTML/text, or render a template by slug or ID.

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `to` | `string \| string[]` | Yes | Recipient address(es) |
| `from` | `string` | No | Sender address (defaults to `PIGEONS_FROM_EMAIL`) |
| `subject` | `string` | Conditional | Required unless using a template |
| `html` | `string` | Conditional | HTML body (required if no `text` or `templateId`) |
| `text` | `string` | Conditional | Plain text body |
| `templateId` | `string` | No | Template ID (`tpl_...`) or slug |
| `data` | `object` | No | Template variables |
| `cc` | `string[]` | No | CC recipients |
| `bcc` | `string[]` | No | BCC recipients |
| `tags` | `string[]` | No | Tags for filtering |
| `headers` | `object` | No | Custom email headers |
| `scheduledAt` | `string` | No | ISO 8601 timestamp for scheduled send |
| `trackOpens` | `boolean` | No | Override global open tracking for this email |

**Response (201):**

```json
{
  "id": "msg_abc123...",
  "status": "queued",
  "from": "noreply@yourdomain.com",
  "to": ["recipient@example.com"],
  "subject": "Hello"
}
```

### Get an email

```
GET /v1/emails/:id
```

Returns the full email object including delivery status, open tracking data, and timestamps.

**Response (200):**

```json
{
  "id": "msg_abc123...",
  "from": "noreply@yourdomain.com",
  "to": ["recipient@example.com"],
  "subject": "Hello",
  "html": "<h1>Hello</h1>",
  "status": "delivered",
  "sesMessageId": "...",
  "trackOpens": false,
  "openCount": 0,
  "firstOpenedAt": null,
  "lastOpenedAt": null,
  "tags": null,
  "scheduledAt": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:05.000Z"
}
```

### List emails

```
GET /v1/emails
```

**Query parameters:**

| Param | Type | Description |
|---|---|---|
| `limit` | `number` | Max results (default 25, max 100) |
| `cursor` | `string` | Pagination cursor |
| `status` | `string` | Filter by status: `queued`, `sending`, `sent`, `delivered`, `bounced`, `complained`, `failed` |

### Cancel a queued email

```
POST /v1/emails/:id/cancel
```

Only emails with status `queued` can be cancelled. Sets status to `failed`.

### Batch send

```
POST /v1/emails/batch
```

Send up to 100 emails in a single request. Request body is an array of send email objects.

**Response (201):** Array of email objects, one per item.

---

## Domains

### Add a domain

```
POST /v1/domains
```

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `domain` | `string` | Yes | Domain name (e.g. `example.com`) |
| `capabilities` | `object` | No | `{ sending: true, receiving: false }` |

**Response (201):** Domain object with DKIM tokens and required DNS records.

### List domains

```
GET /v1/domains
```

**Response (200):**

```json
{
  "data": [
    {
      "id": "dom_abc123...",
      "domain": "example.com",
      "verificationStatus": "verified",
      "dkimTokens": ["token1", "token2", "token3"],
      "spfVerified": true,
      "dmarcVerified": true,
      "region": "us-east-1",
      "capabilities": { "sending": true, "receiving": false },
      "records": [...]
    }
  ]
}
```

### Get domain

```
GET /v1/domains/:id
```

### Verify a domain

```
GET /v1/domains/:id/verify
```

Re-checks DNS records and updates verification status.

### Get domain stats

```
GET /v1/domains/:id/stats
```

Returns delivery statistics and warmup guidance for the domain.

### Delete a domain

```
DELETE /v1/domains/:id
```

---

## Contacts

### Create a contact

```
POST /v1/contacts
```

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | `string` | Yes | Email address (must be unique) |
| `firstName` | `string` | No | First name |
| `lastName` | `string` | No | Last name |
| `tags` | `string[]` | No | Tags for segmentation |
| `properties` | `object` | No | Custom key-value data |

**Response (201):** Full contact object.

### Get a contact

```
GET /v1/contacts/:idOrEmail
```

Accepts either a contact ID (`ctc_...`) or email address.

### List contacts

```
GET /v1/contacts
```

**Query parameters:**

| Param | Type | Description |
|---|---|---|
| `limit` | `number` | Max results (default 25, max 100) |
| `cursor` | `string` | Pagination cursor |
| `tag` | `string` | Filter by tag |

### Update a contact

```
PATCH /v1/contacts/:idOrEmail
```

**Request body:**

| Field | Type | Description |
|---|---|---|
| `firstName` | `string` | First name |
| `lastName` | `string` | Last name |
| `tags` | `string[]` | Replace tags |
| `properties` | `object` | Replace custom properties |

### Delete a contact

```
DELETE /v1/contacts/:idOrEmail
```

### Batch create contacts

```
POST /v1/contacts/batch
```

Create up to 1000 contacts. Existing emails are silently skipped.

**Request body:** Array of contact creation objects.

**Response (201):**

```json
{
  "created": 8,
  "skipped": 2,
  "contacts": [{ "id": "ctc_...", "email": "..." }, ...]
}
```

### Unsubscribe a contact

```
POST /v1/contacts/:idOrEmail/unsubscribe
```

Global unsubscribe, or pass `{ "topicId": "top_..." }` for per-topic unsubscribe.

### Resubscribe a contact

```
POST /v1/contacts/:idOrEmail/resubscribe
```

Same body format as unsubscribe.

---

## Templates

### Create a template

```
POST /v1/templates
```

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `slug` | `string` | Yes | URL-safe identifier (lowercase alphanumeric with hyphens) |
| `name` | `string` | Yes | Display name |
| `subject` | `string` | Yes | Subject line (supports `{{variables}}`) |
| `body` | `string` | Yes | HTML body (supports `{{variables}}`) |
| `sampleData` | `object` | No | Sample data for previews |

### Get a template

```
GET /v1/templates/:idOrSlug
```

Accepts template ID (`tpl_...`) or slug.

### List templates

```
GET /v1/templates
```

### Update a template

```
PATCH /v1/templates/:idOrSlug
```

Updating `body` or `subject` increments the template version.

### Delete a template

```
DELETE /v1/templates/:idOrSlug
```

### Preview a template

```
POST /v1/templates/:idOrSlug/preview
```

**Request body:**

```json
{ "data": { "name": "Alice", "company": "Acme" } }
```

**Response (200):**

```json
{
  "subject": "Welcome, Alice!",
  "html": "<h1>Welcome to Acme</h1>...",
  "text": "Welcome to Acme..."
}
```

---

## Campaigns

### Create a campaign

```
POST /v1/campaigns
```

Creates a campaign in `draft` status.

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | Yes | Campaign name |
| `subject` | `string` | No | Email subject (or use template) |
| `topicId` | `string` | No | Subscription topic ID for unsubscribe filtering |
| `templateId` | `string` | No | Template ID or slug |
| `templateData` | `object` | No | Template variables |
| `fromName` | `string` | No | Sender display name |
| `fromEmail` | `string` | No | Sender email address |
| `audienceFilter` | `object` | No | Filter to select recipients (see [Audience Filters](#audience-filters)) |
| `scheduledAt` | `string` | No | ISO 8601 timestamp for scheduled send |

### List campaigns

```
GET /v1/campaigns
```

**Query parameters:** `limit`, `cursor`, `status` (`draft`, `scheduled`, `sending`, `paused`, `sent`, `cancelled`).

### Get a campaign

```
GET /v1/campaigns/:id
```

Returns the campaign with its `stats` object:

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

### Update a campaign

```
PATCH /v1/campaigns/:id
```

Only `draft` campaigns can be updated.

### Send a campaign

```
POST /v1/campaigns/:id/send
```

Transitions from `draft` or `scheduled` to `sending`. Filters contacts by audience filter, excluding unsubscribed, bounced, and complained contacts.

Optional body: `{ "scheduledAt": "2024-06-01T09:00:00Z" }` to schedule instead of sending immediately.

### Pause a campaign

```
POST /v1/campaigns/:id/pause
```

Only `sending` campaigns can be paused.

### Resume a campaign

```
POST /v1/campaigns/:id/resume
```

Only `paused` campaigns can be resumed.

### Cancel a campaign

```
POST /v1/campaigns/:id/cancel
```

Only `sending` or `scheduled` campaigns can be cancelled.

### Audience Filters

The `audienceFilter` object supports:

```json
{
  "tags": {
    "contains": "newsletter",
    "containsAny": ["vip", "early-adopter"],
    "containsAll": ["active", "verified"]
  },
  "properties": {
    "plan": "pro",
    "region": "us"
  }
}
```

---

## Sequences

### Create a sequence

```
POST /v1/sequences
```

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | Yes | Sequence name |
| `trigger` | `object` | No | `{ event: "contact.created", filter: {...} }` |
| `steps` | `array` | No | Array of step objects |

**Step types:**

- `email` - send an email using `templateId` and optional `subject`, `templateData`, `topicId`
- `delay` - wait for a duration (e.g. `"1d"`, `"12h"`, `"30m"`) via `delayDuration`
- `condition` - evaluate a condition before continuing

### List sequences

```
GET /v1/sequences
```

**Query parameters:** `limit`, `cursor`, `status` (`draft`, `active`, `paused`, `archived`).

### Get a sequence

```
GET /v1/sequences/:id
```

Returns the sequence with all steps and stats.

### Update a sequence

```
PATCH /v1/sequences/:id
```

Active sequences must be paused before updating. Steps are replaced wholesale when provided.

### Activate a sequence

```
POST /v1/sequences/:id/activate
```

Sequence must have at least one step.

### Pause a sequence

```
POST /v1/sequences/:id/pause
```

### Enroll a contact

```
POST /v1/sequences/:id/enroll
```

**Request body:**

```json
{ "contactId": "ctc_abc123..." }
```

Sequence must be `active`. Returns the enrollment object.

### List enrollments

```
GET /v1/sequences/:id/enrollments
```

**Query parameters:** `limit`, `cursor`, `status` (`active`, `completed`, `exited`, `failed`).

---

## Inboxes

### Create an inbox

```
POST /v1/inboxes
```

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | Yes | Inbox name |
| `emailAddress` | `string` | Yes | Email address for this inbox |
| `description` | `string` | No | Description |
| `webhookUrl` | `string` | No | URL to receive inbound message webhooks |
| `metadata` | `object` | No | Arbitrary metadata |
| `labels` | `string[]` | No | Labels for categorization |

### List inboxes

```
GET /v1/inboxes
```

**Query parameters:** `limit`, `cursor`, `status` (`active`, `paused`, `archived`), `label`.

### Get an inbox

```
GET /v1/inboxes/:id
```

### Update an inbox

```
PATCH /v1/inboxes/:id
```

### Delete an inbox

```
DELETE /v1/inboxes/:id
```

### Pause an inbox

```
POST /v1/inboxes/:id/pause
```

### Resume an inbox

```
POST /v1/inboxes/:id/resume
```

### Set catch-all

```
POST /v1/inboxes/:id/catch-all
```

Designates this inbox as the catch-all for unmatched inbound emails. Only one inbox can be catch-all at a time.

### List messages

```
GET /v1/inboxes/:id/messages
```

**Query parameters:** `limit`, `cursor`, `direction` (`inbound`, `outbound`), `thread_id`, `label`.

### Get a message

```
GET /v1/inboxes/:id/messages/:messageId
```

### Send a message

```
POST /v1/inboxes/:id/messages
```

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `to` | `string \| string[]` | Yes | Recipient address(es) |
| `cc` | `string[]` | No | CC recipients |
| `subject` | `string` | No | Subject line |
| `html` | `string` | Conditional | HTML body |
| `text` | `string` | Conditional | Plain text body |
| `inReplyTo` | `string` | No | Message ID to reply to (maintains threading) |
| `labels` | `string[]` | No | Labels |

### List threads

```
GET /v1/inboxes/:id/threads
```

**Query parameters:** `limit`, `cursor`, `status` (`open`, `closed`, `snoozed`).

### Get a thread

```
GET /v1/inboxes/:id/threads/:threadId
```

### Update a thread

```
PATCH /v1/inboxes/:id/threads/:threadId
```

**Request body:**

| Field | Type | Description |
|---|---|---|
| `status` | `string` | `open`, `closed`, or `snoozed` |
| `metadata` | `object` | Arbitrary metadata |

---

## Webhooks

### Create a webhook

```
POST /v1/webhooks
```

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `url` | `string` | Yes | Endpoint URL |
| `events` | `string[]` | Yes | Event types to subscribe to |
| `secret` | `string` | No | Signing secret (min 16 chars). Auto-generated if omitted |

The response includes the `secret` field. It is not returned on subsequent GET requests.

### List webhooks

```
GET /v1/webhooks
```

### Get a webhook

```
GET /v1/webhooks/:id
```

### Update a webhook

```
PATCH /v1/webhooks/:id
```

**Request body:**

| Field | Type | Description |
|---|---|---|
| `url` | `string` | New endpoint URL |
| `events` | `string[]` | New event list |
| `status` | `string` | `active` or `disabled` |

### Delete a webhook

```
DELETE /v1/webhooks/:id
```

---

## API Keys

### Create an API key

```
POST /v1/api-keys
```

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | Yes | Key name for identification |
| `scopes` | `string[]` | No | Restrict to specific scopes (omit for full access) |
| `expiresAt` | `string` | No | ISO 8601 expiration timestamp |

Available scopes: `emails`, `domains`, `api_keys`, `templates`, `contacts`, `inboxes`, `webhooks`, `campaigns`, `sequences`, `topics`, `stats`, or `*` for all.

**Response (201):** Includes the full API key in the `key` field. This is the only time the key is returned.

### List API keys

```
GET /v1/api-keys
```

Returns all keys with `prefix` (first characters) but not the full key.

### Delete an API key

```
DELETE /v1/api-keys/:id
```

---

## Unauthenticated Endpoints

These endpoints sit outside auth middleware:

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check - returns `{ "status": "ok" }` |
| `POST` | `/v1/internal/ses/events` | SES delivery/bounce/complaint events via SNS |
| `POST` | `/v1/internal/ses/inbound` | SES inbound email notifications via SNS |
| `GET` | `/v1/t/:emailId` | Open tracking pixel (1x1 transparent GIF) |

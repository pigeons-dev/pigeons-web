---
title: Campaigns & Sequences
description: Send bulk campaigns to targeted audiences and build multi-step automated sequences.
---

## Campaigns

A campaign sends one email to a set of contacts, filtered by tags and properties.

### Lifecycle

```
draft → sending → sent
         ↓  ↑
        paused

draft → scheduled → sending → sent
                      ↓
                   cancelled
```

| Status | Meaning |
|---|---|
| `draft` | Campaign is being configured. Can be edited. |
| `scheduled` | Waiting for `scheduledAt` time. Can be cancelled. |
| `sending` | Actively sending to recipients. Can be paused or cancelled. |
| `paused` | Sending paused. Can be resumed. |
| `sent` | All emails have been processed. |
| `cancelled` | Campaign was cancelled before completing. |

### Create a campaign

```bash
curl -X POST http://localhost:3891/v1/campaigns \
  -H "x-api-key: pgn_..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "October Newsletter",
    "templateId": "monthly-newsletter",
    "templateData": {"month": "October", "highlight": "New API features"},
    "audienceFilter": {"tags": {"contains": "newsletter"}},
    "fromName": "Acme Updates",
    "fromEmail": "newsletter@yourdomain.com"
  }'
```

```typescript
const campaign = await pigeons.campaigns.create({
  name: 'October Newsletter',
  templateId: 'monthly-newsletter',
  templateData: { month: 'October', highlight: 'New API features' },
  audienceFilter: { tags: { contains: 'newsletter' } },
  fromName: 'Acme Updates',
  fromEmail: 'newsletter@yourdomain.com',
})
```

### Audience Filters

The `audienceFilter` object determines which contacts receive the campaign. Contacts where `unsubscribed`, `bounced`, or `complained` is true are always excluded.

#### Filter by tags

```json
{
  "audienceFilter": {
    "tags": {
      "contains": "newsletter"
    }
  }
}
```

| Operator | Description |
|---|---|
| `contains` | Contact must have this exact tag |
| `containsAny` | Contact must have at least one of these tags |
| `containsAll` | Contact must have all of these tags |

```json
{
  "tags": {
    "containsAll": ["newsletter", "active"],
    "containsAny": ["pro", "enterprise"]
  }
}
```

#### Filter by properties

```json
{
  "audienceFilter": {
    "properties": {
      "plan": "pro",
      "region": "us"
    }
  }
}
```

Properties match on exact equality. All specified properties must match.

#### Combined filters

```json
{
  "audienceFilter": {
    "tags": {"contains": "newsletter"},
    "properties": {"plan": "pro"}
  }
}
```

#### No filter

Omit `audienceFilter` to target all eligible contacts (those not unsubscribed, bounced, or complained).

### Send a campaign

```bash
# Send immediately
curl -X POST http://localhost:3891/v1/campaigns/cmp_abc123.../send \
  -H "x-api-key: pgn_..."

# Schedule for later
curl -X POST http://localhost:3891/v1/campaigns/cmp_abc123.../send \
  -H "x-api-key: pgn_..." \
  -H "Content-Type: application/json" \
  -d '{"scheduledAt": "2024-06-01T09:00:00Z"}'
```

The campaign must have either a `templateId` or a `subject`. When sending, Pigeons:

1. Queries all contacts matching the audience filter
2. Excludes unsubscribed, bounced, and complained contacts
3. Creates a job to send to each eligible contact
4. Updates the `stats.total` field with the audience size

If no eligible contacts match, the send fails with a validation error.

### Pause / Resume / Cancel

```bash
# Pause (only while sending)
curl -X POST http://localhost:3891/v1/campaigns/cmp_abc123.../pause \
  -H "x-api-key: pgn_..."

# Resume (only while paused)
curl -X POST http://localhost:3891/v1/campaigns/cmp_abc123.../resume \
  -H "x-api-key: pgn_..."

# Cancel (while sending or scheduled)
curl -X POST http://localhost:3891/v1/campaigns/cmp_abc123.../cancel \
  -H "x-api-key: pgn_..."
```

### Campaign stats

```typescript
const campaign = await pigeons.campaigns.get('cmp_abc123...')
console.log(campaign.stats)
```

```json
{
  "total": 500,
  "sent": 450,
  "delivered": 440,
  "opened": 120,
  "bounced": 5,
  "complained": 1,
  "failed": 4
}
```

Stats update in real time as SES delivery events arrive. The `opened` count requires [open tracking](/docs/open-tracking) to be enabled.

### Topic-scoped campaigns

Link a campaign to a subscription topic so contacts who unsubscribed from that specific topic are excluded:

```typescript
const campaign = await pigeons.campaigns.create({
  name: 'Marketing Update',
  topicId: 'top_marketing...',
  templateId: 'marketing-update',
  audienceFilter: { tags: { contains: 'active' } },
})
```

---

## Sequences

A sequence is a multi-step automation that sends a series of emails to individual contacts over time.

### Create a sequence

```bash
curl -X POST http://localhost:3891/v1/sequences \
  -H "x-api-key: pgn_..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Onboarding",
    "steps": [
      {"type": "email", "templateId": "welcome-email", "subject": "Welcome!"},
      {"type": "delay", "delayDuration": "1d"},
      {"type": "email", "templateId": "getting-started", "subject": "Getting Started"},
      {"type": "delay", "delayDuration": "3d"},
      {"type": "email", "templateId": "tips", "subject": "Pro Tips"}
    ]
  }'
```

### Step types

| Type | Fields | Description |
|---|---|---|
| `email` | `templateId`, `subject`, `templateData`, `topicId` | Sends an email using a template |
| `delay` | `delayDuration` | Waits before proceeding. Format: `30m`, `12h`, `1d`, `7d` |
| `condition` | `condition` | Evaluates a condition before continuing |

### Sequence lifecycle

| Status | Meaning |
|---|---|
| `draft` | Being configured. Can't enroll contacts yet. |
| `active` | Running. Contacts can be enrolled. |
| `paused` | Temporarily stopped. Active enrollments are frozen. |
| `archived` | Permanently disabled. |

### Activate a sequence

A sequence must have at least one step before it can be activated:

```bash
curl -X POST http://localhost:3891/v1/sequences/seq_abc123.../activate \
  -H "x-api-key: pgn_..."
```

### Enroll a contact

```bash
curl -X POST http://localhost:3891/v1/sequences/seq_abc123.../enroll \
  -H "x-api-key: pgn_..." \
  -H "Content-Type: application/json" \
  -d '{"contactId": "ctc_def456..."}'
```

```typescript
const enrollment = await pigeons.sequences.enroll('seq_abc123...', 'ctc_def456...')
console.log(enrollment.status) // "active"
```

The sequence must be `active`. Enrollment creates a job to process the first step.

### Enrollment statuses

| Status | Meaning |
|---|---|
| `active` | Currently progressing through steps |
| `completed` | Finished all steps |
| `exited` | Removed early (e.g. unsubscribed) |
| `failed` | A step failed |

### Monitor enrollments

```bash
curl "http://localhost:3891/v1/sequences/seq_abc123.../enrollments?status=active" \
  -H "x-api-key: pgn_..."
```

### Update a sequence

Pause the sequence first, then update:

```bash
curl -X POST http://localhost:3891/v1/sequences/seq_abc123.../pause \
  -H "x-api-key: pgn_..."

curl -X PATCH http://localhost:3891/v1/sequences/seq_abc123... \
  -H "x-api-key: pgn_..." \
  -H "Content-Type: application/json" \
  -d '{"steps": [...]}'
```

When steps are provided in an update, the entire step list is replaced.

### Sequence stats

```json
{
  "stats": {
    "enrolled": 150,
    "completed": 80,
    "exited": 10,
    "active": 60
  }
}
```

Per-step stats track `sent`, `delivered`, `opened`, `bounced`, and `complained` for each email step.

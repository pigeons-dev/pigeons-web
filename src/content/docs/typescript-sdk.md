# TypeScript SDK

## Install

```bash
npm install @pigeons/pigeons-ts
```

## Initialize

```typescript
import { Pigeons } from '@pigeons/pigeons-ts'

const pigeons = new Pigeons({
  baseUrl: 'https://pigeons.yourdomain.com',
  apiKey: 'pgn_your_key_here',
})
```

Both options can be set via environment variables instead:

| Option | Env var | Description |
|---|---|---|
| `baseUrl` | `PIGEONS_URL` | Pigeons server URL (no default) |
| `apiKey` | `PIGEONS_API_KEY` | API key starting with `pgn_` |

Constructor values take precedence over environment variables.

---

## Emails

### Send an email

```typescript
const email = await pigeons.emails.send({
  to: 'alice@example.com',
  subject: 'Welcome!',
  html: '<h1>Welcome aboard</h1>',
})

console.log(email.id)     // msg_abc123...
console.log(email.status) // "queued"
```

### Send with a template

```typescript
const email = await pigeons.emails.send({
  to: 'alice@example.com',
  templateId: 'welcome-email', // slug or tpl_ ID
  data: { name: 'Alice', company: 'Acme' },
})
```

### Multiple recipients

```typescript
const email = await pigeons.emails.send({
  to: ['alice@example.com', 'bob@example.com'],
  cc: ['manager@example.com'],
  subject: 'Team Update',
  html: '<p>Here is your update.</p>',
})
```

### Schedule an email

```typescript
const email = await pigeons.emails.send({
  to: 'alice@example.com',
  subject: 'Reminder',
  text: 'Your trial expires tomorrow.',
  scheduledAt: '2024-06-01T09:00:00Z',
})
```

### Get email status

```typescript
const email = await pigeons.emails.get('msg_abc123...')
console.log(email.status) // "delivered"
```

### List emails

```typescript
const page = await pigeons.emails.list({ limit: 10, status: 'delivered' })

for (const email of page.data) {
  console.log(email.id, email.subject, email.status)
}

if (page.has_more) {
  const next = await pigeons.emails.list({ cursor: page.next_cursor! })
}
```

### Cancel a queued email

```typescript
const cancelled = await pigeons.emails.cancel('msg_abc123...')
```

### Batch send

```typescript
const results = await pigeons.emails.batch([
  { to: 'alice@example.com', subject: 'Hi Alice', text: 'Hello!' },
  { to: 'bob@example.com', subject: 'Hi Bob', text: 'Hello!' },
])
```

### Idempotent sends

```typescript
const email = await pigeons.emails.send(
  { to: 'alice@example.com', subject: 'Order #123', html: '...' },
  { idempotencyKey: 'order-123-confirmation' },
)
```

---

## Contacts

### Create a contact

```typescript
const contact = await pigeons.contacts.create({
  email: 'alice@example.com',
  firstName: 'Alice',
  lastName: 'Smith',
  tags: ['newsletter', 'beta'],
  properties: { plan: 'pro', signupSource: 'website' },
})
```

### Get a contact

```typescript
// By ID
const contact = await pigeons.contacts.get('ctc_abc123...')

// By email
const contact = await pigeons.contacts.get('alice@example.com')
```

### Update a contact

```typescript
const updated = await pigeons.contacts.update('ctc_abc123...', {
  tags: ['newsletter', 'beta', 'vip'],
  properties: { plan: 'enterprise' },
})
```

### List contacts

```typescript
const page = await pigeons.contacts.list({ tag: 'newsletter', limit: 50 })
```

### Delete a contact

```typescript
await pigeons.contacts.delete('ctc_abc123...')
```

### Batch create

```typescript
const result = await pigeons.contacts.batchCreate([
  { email: 'alice@example.com', firstName: 'Alice', tags: ['import'] },
  { email: 'bob@example.com', firstName: 'Bob', tags: ['import'] },
])
console.log(result.created) // 2
console.log(result.skipped) // 0
```

### Unsubscribe / Resubscribe

```typescript
// Global unsubscribe
await pigeons.contacts.unsubscribe('ctc_abc123...')

// Per-topic unsubscribe
await pigeons.contacts.unsubscribe('ctc_abc123...', { topicId: 'top_xyz...' })

// Resubscribe
await pigeons.contacts.resubscribe('ctc_abc123...')
```

---

## Templates

### Create a template

```typescript
const template = await pigeons.templates.create({
  slug: 'welcome-email',
  name: 'Welcome Email',
  subject: 'Welcome, {{name}}!',
  body: '<h1>Welcome to {{company}}</h1><p>Hi {{name}},</p>',
  sampleData: { name: 'Alice', company: 'Acme' },
})
```

### Get / Update / Delete

```typescript
const tpl = await pigeons.templates.get('welcome-email') // by slug or ID
const updated = await pigeons.templates.update('welcome-email', { subject: 'New subject' })
await pigeons.templates.delete('welcome-email')
```

### Preview a template

```typescript
const preview = await pigeons.templates.preview('welcome-email', {
  name: 'Alice',
  company: 'Acme',
})
console.log(preview.subject) // "Welcome, Alice!"
console.log(preview.html)    // rendered HTML
```

---

## Campaigns

### Create and send a campaign

```typescript
const campaign = await pigeons.campaigns.create({
  name: 'Product Launch',
  templateId: 'product-launch',
  templateData: { launchDate: '2024-06-01' },
  audienceFilter: { tags: { contains: 'newsletter' } },
})

// Send immediately
await pigeons.campaigns.send(campaign.id)

// Or schedule
await pigeons.campaigns.send(campaign.id, {
  scheduledAt: '2024-06-01T09:00:00Z',
})
```

### Campaign lifecycle

```typescript
await pigeons.campaigns.pause(campaign.id)
await pigeons.campaigns.resume(campaign.id)
await pigeons.campaigns.cancel(campaign.id)
```

### Monitor stats

```typescript
const campaign = await pigeons.campaigns.get('cmp_abc123...')
console.log(campaign.stats)
// { total: 500, sent: 450, delivered: 440, opened: 120, bounced: 5, complained: 1, failed: 4 }
```

---

## Sequences

### Create a sequence

```typescript
const sequence = await pigeons.sequences.create({
  name: 'Onboarding',
  steps: [
    { type: 'email', templateId: 'welcome-email', subject: 'Welcome!' },
    { type: 'delay', delayDuration: '1d' },
    { type: 'email', templateId: 'getting-started', subject: 'Getting Started' },
    { type: 'delay', delayDuration: '3d' },
    { type: 'email', templateId: 'tips', subject: 'Pro Tips' },
  ],
})
```

### Activate and enroll

```typescript
await pigeons.sequences.activate(sequence.id)

const enrollment = await pigeons.sequences.enroll(sequence.id, 'ctc_abc123...')
console.log(enrollment.status) // "active"
```

### Monitor enrollments

```typescript
const page = await pigeons.sequences.enrollments(sequence.id, { status: 'active' })
```

---

## Inboxes

### Create an inbox

```typescript
const inbox = await pigeons.inboxes.create({
  name: 'Support',
  emailAddress: 'support@yourdomain.com',
  webhookUrl: 'https://your-app.com/webhooks/email',
})
```

### Inbox operations

```typescript
await pigeons.inboxes.pause(inbox.id)
await pigeons.inboxes.resume(inbox.id)
await pigeons.inboxes.setCatchAll(inbox.id)
await pigeons.inboxes.delete(inbox.id)
```

### Read messages

```typescript
const messages = await pigeons.inboxes.messages.list(inbox.id, {
  direction: 'inbound',
  limit: 10,
})

const message = await pigeons.inboxes.messages.get(inbox.id, 'imsg_abc123...')
```

### Send from an inbox

```typescript
const sent = await pigeons.inboxes.messages.create(inbox.id, {
  to: 'customer@example.com',
  subject: 'Re: Your ticket',
  html: '<p>Thanks for reaching out.</p>',
  inReplyTo: 'imsg_previous...', // maintains thread
})
```

### Threads

```typescript
const threads = await pigeons.inboxes.threads.list(inbox.id, { status: 'open' })

const thread = await pigeons.inboxes.threads.get(inbox.id, 'thr_abc123...')

await pigeons.inboxes.threads.update(inbox.id, 'thr_abc123...', {
  status: 'closed',
})
```

---

## Webhooks

```typescript
const webhook = await pigeons.webhooks.create({
  url: 'https://your-app.com/webhooks/pigeons',
  events: ['email.delivered', 'email.bounced', 'inbox.message.received'],
})

// The secret is only returned on creation
console.log(webhook.secret) // "whsec_..."
```

---

## Domains

```typescript
const domain = await pigeons.domains.add({ domain: 'example.com' })
console.log(domain.records) // DNS records to add

// Re-check verification
const verified = await pigeons.domains.verify(domain.id)
console.log(verified.verificationStatus) // "verified"
```

---

## Error Handling

All errors extend `PigeonsError`:

```typescript
import { PigeonsError, NotFoundError, AuthError, RateLimitError } from '@pigeons/pigeons-ts'

try {
  await pigeons.emails.get('msg_nonexistent')
} catch (err) {
  if (err instanceof NotFoundError) {
    console.log(err.message)    // "Email 'msg_nonexistent' not found"
    console.log(err.statusCode) // 404
    console.log(err.code)       // "not_found"
    console.log(err.type)       // "not_found"
  }
}
```

Error classes:

| Class | Status | When |
|---|---|---|
| `PigeonsError` | varies | Base class for all errors |
| `ValidationError` | 400 | Invalid request parameters |
| `AuthError` | 401 | Missing or invalid API key |
| `NotFoundError` | 404 | Resource not found |
| `RateLimitError` | 429 | Rate limit exceeded |

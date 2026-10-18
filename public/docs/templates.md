---
title: Templates
description: Create reusable email templates with variables for campaigns and transactional sends.
---

## Create a Template

Templates have a unique slug, a subject line, and an HTML body. Both subject and body support `{{variable}}` interpolation.

```bash
curl -X POST http://localhost:3891/v1/templates \
  -H "x-api-key: pgn_..." \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "welcome-email",
    "name": "Welcome Email",
    "subject": "Welcome, {{name}}!",
    "body": "<h1>Welcome to {{company}}</h1><p>Hi {{name}}, thanks for signing up.</p>",
    "sampleData": {"name": "Alice", "company": "Acme"}
  }'
```

```typescript
const template = await pigeons.templates.create({
  slug: 'welcome-email',
  name: 'Welcome Email',
  subject: 'Welcome, {{name}}!',
  body: '<h1>Welcome to {{company}}</h1><p>Hi {{name}}, thanks for signing up.</p>',
  sampleData: { name: 'Alice', company: 'Acme' },
})
```

### Slug rules

- Lowercase letters, numbers, and hyphens only
- Must be unique across all templates
- Used as a stable identifier in API calls (alternative to `tpl_` IDs)

## Variables

Use `{{variableName}}` in both the subject and body. Variables are replaced with values from the `data` object at send time.

```html
<h1>Welcome to {{company}}</h1>
<p>Hi {{name}},</p>
<p>Your account is ready. Your plan: {{plan}}.</p>
```

Sent with:

```json
{
  "data": {
    "name": "Alice",
    "company": "Acme",
    "plan": "Pro"
  }
}
```

Produces:

```html
<h1>Welcome to Acme</h1>
<p>Hi Alice,</p>
<p>Your account is ready. Your plan: Pro.</p>
```

## Sample Data

The `sampleData` field stores default variable values for previewing the template without passing data:

```json
{
  "sampleData": {
    "name": "Alice",
    "company": "Acme",
    "plan": "Pro"
  }
}
```

This data is used by the preview endpoint and is never sent to real recipients.

## Preview a Template

Render a template without sending:

```bash
curl -X POST http://localhost:3891/v1/templates/welcome-email/preview \
  -H "x-api-key: pgn_..." \
  -H "Content-Type: application/json" \
  -d '{"data": {"name": "Bob", "company": "Widgets Inc"}}'
```

If no `data` is provided, the template's `sampleData` is used.

Response:

```json
{
  "subject": "Welcome, Bob!",
  "html": "<h1>Welcome to Widgets Inc</h1>...",
  "text": "Welcome to Widgets Inc..."
}
```

The response includes both HTML and a plain-text version automatically generated from the HTML.

## Using Templates in Sends

### Direct send

Pass the template slug or ID in `templateId`, and variables in `data`:

```bash
curl -X POST http://localhost:3891/v1/emails \
  -H "x-api-key: pgn_..." \
  -H "Content-Type: application/json" \
  -d '{
    "to": "alice@example.com",
    "templateId": "welcome-email",
    "data": {"name": "Alice", "company": "Acme"}
  }'
```

```typescript
const email = await pigeons.emails.send({
  to: 'alice@example.com',
  templateId: 'welcome-email',
  data: { name: 'Alice', company: 'Acme' },
})
```

The subject is rendered from the template. You can override it by passing `subject` explicitly.

### In campaigns

Assign a template to a campaign. The `templateData` provides variables:

```typescript
const campaign = await pigeons.campaigns.create({
  name: 'Product Launch',
  templateId: 'product-launch',
  templateData: { launchDate: '2024-06-01', featureName: 'Dark Mode' },
  audienceFilter: { tags: { contains: 'newsletter' } },
})
```

### In sequences

Each email step in a sequence can reference a template:

```typescript
const sequence = await pigeons.sequences.create({
  name: 'Onboarding',
  steps: [
    { type: 'email', templateId: 'welcome-email', subject: 'Welcome!' },
    { type: 'delay', delayDuration: '1d' },
    { type: 'email', templateId: 'getting-started' },
  ],
})
```

## Lookup by Slug or ID

All template endpoints accept either the `tpl_` prefixed ID or the slug:

```bash
# By slug
curl http://localhost:3891/v1/templates/welcome-email -H "x-api-key: pgn_..."

# By ID
curl http://localhost:3891/v1/templates/tpl_abc123... -H "x-api-key: pgn_..."
```

## Versioning

Templates are automatically versioned. The `version` field starts at 1 and increments when you update the `subject` or `body`. This lets you track changes over time.

```typescript
const updated = await pigeons.templates.update('welcome-email', {
  body: '<h1>New design</h1><p>Hi {{name}}</p>',
})
console.log(updated.version) // 2
```

Updating only `name` or `sampleData` does not increment the version.

## Delete a Template

```bash
curl -X DELETE http://localhost:3891/v1/templates/welcome-email \
  -H "x-api-key: pgn_..."
```

Deleting a template does not affect emails already sent using it.

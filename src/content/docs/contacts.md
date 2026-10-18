# Contacts

## Create a Contact

```bash
curl -X POST http://localhost:3891/v1/contacts \
  -H "x-api-key: pgn_..." \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "firstName": "Alice",
    "lastName": "Smith",
    "tags": ["newsletter", "beta"],
    "properties": {"plan": "pro", "company": "Acme"}
  }'
```

```typescript
const contact = await pigeons.contacts.create({
  email: 'alice@example.com',
  firstName: 'Alice',
  tags: ['newsletter', 'beta'],
  properties: { plan: 'pro', company: 'Acme' },
})
```

Email addresses must be unique. Creating a contact with an existing email returns a 409 conflict.

## Tags

Tags are freeform strings used for segmentation. Use them to categorize contacts and target campaigns.

```json
{
  "tags": ["newsletter", "beta", "enterprise"]
}
```

Tags are stored as an array on the contact. When updating tags, the entire array is replaced (not merged). To add a tag without removing existing ones, read the current tags first.

### Filter by tag

```bash
curl "http://localhost:3891/v1/contacts?tag=newsletter" \
  -H "x-api-key: pgn_..."
```

### Use tags in audience filters

Campaigns and sequences use tags to target recipients:

```json
{
  "audienceFilter": {
    "tags": {
      "contains": "newsletter"
    }
  }
}
```

Available tag filters:

| Filter | Description |
|---|---|
| `contains` | Contact must have this tag |
| `containsAny` | Contact must have at least one of these tags |
| `containsAll` | Contact must have all of these tags |

## Properties

Properties are arbitrary key-value data stored on a contact. Use them for structured data that doesn't fit tags.

```json
{
  "properties": {
    "plan": "pro",
    "company": "Acme",
    "signupDate": "2024-01-15",
    "referralSource": "website"
  }
}
```

Properties can be used in audience filters for campaigns:

```json
{
  "audienceFilter": {
    "properties": {
      "plan": "pro"
    }
  }
}
```

Property filters match on exact equality.

## Batch Import

Import up to 1000 contacts in a single request:

```bash
curl -X POST http://localhost:3891/v1/contacts/batch \
  -H "x-api-key: pgn_..." \
  -H "Content-Type: application/json" \
  -d '[
    {"email": "alice@example.com", "firstName": "Alice", "tags": ["import"]},
    {"email": "bob@example.com", "firstName": "Bob", "tags": ["import"]},
    {"email": "carol@example.com", "firstName": "Carol", "tags": ["import"]}
  ]'
```

```typescript
const result = await pigeons.contacts.batchCreate([
  { email: 'alice@example.com', firstName: 'Alice', tags: ['import'] },
  { email: 'bob@example.com', firstName: 'Bob', tags: ['import'] },
  { email: 'carol@example.com', firstName: 'Carol', tags: ['import'] },
])
// { created: 3, skipped: 0, contacts: [...] }
```

Existing email addresses are silently skipped and counted in the `skipped` field.

## List with Filters

```bash
# List all contacts
curl "http://localhost:3891/v1/contacts" -H "x-api-key: pgn_..."

# Filter by tag
curl "http://localhost:3891/v1/contacts?tag=newsletter" -H "x-api-key: pgn_..."

# Paginate
curl "http://localhost:3891/v1/contacts?limit=50&cursor=2024-01-15T10:30:00.000Z" \
  -H "x-api-key: pgn_..."
```

## Get by ID or Email

Contacts can be retrieved by either their ID (`ctc_...`) or email address:

```bash
# By ID
curl http://localhost:3891/v1/contacts/ctc_abc123... -H "x-api-key: pgn_..."

# By email
curl http://localhost:3891/v1/contacts/alice@example.com -H "x-api-key: pgn_..."
```

The same applies to update, delete, unsubscribe, and resubscribe endpoints.

## Unsubscribe Handling

### Global unsubscribe

Marks the contact as unsubscribed from all emails. Campaigns and sequences skip unsubscribed contacts.

```bash
curl -X POST http://localhost:3891/v1/contacts/ctc_abc123.../unsubscribe \
  -H "x-api-key: pgn_..."
```

### Per-topic unsubscribe

Unsubscribe from a specific topic (e.g. "marketing" but not "product-updates"). First create subscription topics, then pass the topic ID:

```bash
curl -X POST http://localhost:3891/v1/contacts/ctc_abc123.../unsubscribe \
  -H "x-api-key: pgn_..." \
  -H "Content-Type: application/json" \
  -d '{"topicId": "top_xyz..."}'
```

Campaigns linked to a topic via `topicId` will skip contacts unsubscribed from that topic.

### Resubscribe

```bash
# Global resubscribe
curl -X POST http://localhost:3891/v1/contacts/ctc_abc123.../resubscribe \
  -H "x-api-key: pgn_..."

# Per-topic resubscribe
curl -X POST http://localhost:3891/v1/contacts/ctc_abc123.../resubscribe \
  -H "x-api-key: pgn_..." \
  -H "Content-Type: application/json" \
  -d '{"topicId": "top_xyz..."}'
```

## Automatic Status Tracking

Pigeons automatically updates contact status based on email events:

| Field | Set when |
|---|---|
| `bounced` / `bouncedAt` | SES reports a hard bounce for this contact |
| `complained` / `complainedAt` | SES reports a complaint (spam report) |
| `unsubscribed` / `unsubscribedAt` | Unsubscribe endpoint is called |

Campaigns and sequences automatically exclude contacts where `unsubscribed`, `bounced`, or `complained` is true.

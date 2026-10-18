---
title: Python SDK
description: Send emails, manage contacts, and build automations with the Python SDK.
---

## Install

```bash
pip install pigeons-py
```

## Initialize

```python
from pigeons import Pigeons

pigeons = Pigeons(
    base_url="https://pigeons.yourdomain.com",
    api_key="pgn_your_key_here",
)
```

Both options can be set via environment variables instead:

| Option | Env var | Description |
|---|---|---|
| `base_url` | `PIGEONS_URL` | Pigeons server URL (no default) |
| `api_key` | `PIGEONS_API_KEY` | API key starting with `pgn_` |

Constructor values take precedence over environment variables.

---

## Emails

### Send an email

```python
email = pigeons.emails.send(
    to="alice@example.com",
    subject="Welcome!",
    html="<h1>Welcome aboard</h1>",
)

print(email.id)      # msg_abc123...
print(email.status)  # "queued"
```

### Send with a template

```python
email = pigeons.emails.send(
    to="alice@example.com",
    template_id="welcome-email",  # slug or tpl_ ID
    data={"name": "Alice", "company": "Acme"},
)
```

### Multiple recipients

```python
email = pigeons.emails.send(
    to=["alice@example.com", "bob@example.com"],
    cc=["manager@example.com"],
    subject="Team Update",
    html="<p>Here is your update.</p>",
)
```

### Schedule an email

```python
email = pigeons.emails.send(
    to="alice@example.com",
    subject="Reminder",
    text="Your trial expires tomorrow.",
    scheduled_at="2024-06-01T09:00:00Z",
)
```

### Get email status

```python
email = pigeons.emails.get("msg_abc123...")
print(email.status)  # "delivered"
```

### List emails

```python
page = pigeons.emails.list(limit=10, status="delivered")

for email in page.data:
    print(email.id, email.subject, email.status)

if page.has_more:
    next_page = pigeons.emails.list(cursor=page.next_cursor)
```

### Cancel a queued email

```python
cancelled = pigeons.emails.cancel("msg_abc123...")
```

### Batch send

```python
results = pigeons.emails.batch([
    {"to": "alice@example.com", "subject": "Hi Alice", "text": "Hello!"},
    {"to": "bob@example.com", "subject": "Hi Bob", "text": "Hello!"},
])
```

### Idempotent sends

```python
email = pigeons.emails.send(
    to="alice@example.com",
    subject="Order #123",
    html="...",
    idempotency_key="order-123-confirmation",
)
```

---

## Contacts

### Create a contact

```python
contact = pigeons.contacts.create(
    email="alice@example.com",
    first_name="Alice",
    last_name="Smith",
    tags=["newsletter", "beta"],
    properties={"plan": "pro", "signup_source": "website"},
)
```

### Get a contact

```python
# By ID
contact = pigeons.contacts.get("ctc_abc123...")

# By email
contact = pigeons.contacts.get("alice@example.com")
```

### Update a contact

```python
updated = pigeons.contacts.update("ctc_abc123...", tags=["newsletter", "vip"])
```

### List contacts

```python
page = pigeons.contacts.list(tag="newsletter", limit=50)
```

### Delete a contact

```python
pigeons.contacts.delete("ctc_abc123...")
```

### Batch create

```python
result = pigeons.contacts.batch_create([
    {"email": "alice@example.com", "first_name": "Alice", "tags": ["import"]},
    {"email": "bob@example.com", "first_name": "Bob", "tags": ["import"]},
])
print(result.created)  # 2
print(result.skipped)  # 0
```

### Unsubscribe / Resubscribe

```python
# Global unsubscribe
pigeons.contacts.unsubscribe("ctc_abc123...")

# Per-topic unsubscribe
pigeons.contacts.unsubscribe("ctc_abc123...", topic_id="top_xyz...")

# Resubscribe
pigeons.contacts.resubscribe("ctc_abc123...")
```

---

## Templates

### Create a template

```python
template = pigeons.templates.create(
    slug="welcome-email",
    name="Welcome Email",
    subject="Welcome, {{name}}!",
    body="<h1>Welcome to {{company}}</h1><p>Hi {{name}},</p>",
    sample_data={"name": "Alice", "company": "Acme"},
)
```

### Get / Update / Delete

```python
tpl = pigeons.templates.get("welcome-email")  # by slug or ID
updated = pigeons.templates.update("welcome-email", subject="New subject")
pigeons.templates.delete("welcome-email")
```

### Preview a template

```python
preview = pigeons.templates.preview("welcome-email", data={"name": "Alice", "company": "Acme"})
print(preview.subject)  # "Welcome, Alice!"
print(preview.html)     # rendered HTML
```

---

## Campaigns

### Create and send a campaign

```python
campaign = pigeons.campaigns.create(
    name="Product Launch",
    template_id="product-launch",
    template_data={"launch_date": "2024-06-01"},
    audience_filter={"tags": {"contains": "newsletter"}},
)

# Send immediately
pigeons.campaigns.send(campaign.id)

# Or schedule
pigeons.campaigns.send(campaign.id, scheduled_at="2024-06-01T09:00:00Z")
```

### Campaign lifecycle

```python
pigeons.campaigns.pause(campaign.id)
pigeons.campaigns.resume(campaign.id)
pigeons.campaigns.cancel(campaign.id)
```

### Monitor stats

```python
campaign = pigeons.campaigns.get("cmp_abc123...")
print(campaign.stats)
# {"total": 500, "sent": 450, "delivered": 440, "opened": 120, ...}
```

---

## Sequences

### Create a sequence

```python
sequence = pigeons.sequences.create(
    name="Onboarding",
    steps=[
        {"type": "email", "template_id": "welcome-email", "subject": "Welcome!"},
        {"type": "delay", "delay_duration": "1d"},
        {"type": "email", "template_id": "getting-started", "subject": "Getting Started"},
        {"type": "delay", "delay_duration": "3d"},
        {"type": "email", "template_id": "tips", "subject": "Pro Tips"},
    ],
)
```

### Activate and enroll

```python
pigeons.sequences.activate(sequence.id)

enrollment = pigeons.sequences.enroll(sequence.id, "ctc_abc123...")
print(enrollment.status)  # "active"
```

### Monitor enrollments

```python
page = pigeons.sequences.enrollments(sequence.id, status="active")
```

---

## Inboxes

### Create an inbox

```python
inbox = pigeons.inboxes.create(
    name="Support",
    email_address="support@yourdomain.com",
    webhook_url="https://your-app.com/webhooks/email",
)
```

### Inbox operations

```python
pigeons.inboxes.pause(inbox.id)
pigeons.inboxes.resume(inbox.id)
pigeons.inboxes.set_catch_all(inbox.id)
pigeons.inboxes.delete(inbox.id)
```

### Read messages

```python
messages = pigeons.inboxes.messages.list(inbox.id, direction="inbound", limit=10)

message = pigeons.inboxes.messages.get(inbox.id, "imsg_abc123...")
```

### Send from an inbox

```python
sent = pigeons.inboxes.messages.create(
    inbox.id,
    to="customer@example.com",
    subject="Re: Your ticket",
    html="<p>Thanks for reaching out.</p>",
    in_reply_to="imsg_previous...",  # maintains thread
)
```

### Threads

```python
threads = pigeons.inboxes.threads.list(inbox.id, status="open")

thread = pigeons.inboxes.threads.get(inbox.id, "thr_abc123...")

pigeons.inboxes.threads.update(inbox.id, "thr_abc123...", status="closed")
```

---

## Webhooks

```python
webhook = pigeons.webhooks.create(
    url="https://your-app.com/webhooks/pigeons",
    events=["email.delivered", "email.bounced", "inbox.message.received"],
)

# The secret is only returned on creation
print(webhook.secret)  # "whsec_..."
```

---

## Domains

```python
domain = pigeons.domains.add(domain="example.com")
print(domain.records)  # DNS records to add

# Re-check verification
verified = pigeons.domains.verify(domain.id)
print(verified.verification_status)  # "verified"
```

---

## Error Handling

All errors extend `PigeonsError`:

```python
from pigeons import PigeonsError, NotFoundError, AuthError, RateLimitError

try:
    pigeons.emails.get("msg_nonexistent")
except NotFoundError as e:
    print(e.message)      # "Email 'msg_nonexistent' not found"
    print(e.status_code)  # 404
    print(e.code)         # "not_found"
except PigeonsError as e:
    print(f"API error: {e.message}")
```

Error classes:

| Class | Status | When |
|---|---|---|
| `PigeonsError` | varies | Base class for all errors |
| `ValidationError` | 400 | Invalid request parameters |
| `AuthError` | 401 | Missing or invalid API key |
| `NotFoundError` | 404 | Resource not found |
| `RateLimitError` | 429 | Rate limit exceeded |

# Inboxes

## Overview

Pigeons inboxes let you receive email at real addresses and access messages via API. The inbound pipeline:

1. Someone sends email to `support@yourdomain.com`
2. SES receipt rule saves the raw MIME to S3 and notifies via SNS
3. Pigeons receives the SNS notification, fetches the email from S3, parses it
4. The message is routed to the matching inbox, threaded, and stored
5. Webhooks fire with the `inbox.message.received` event

## Prerequisites

Inbound email requires:

- An AWS region that supports SES inbound (`us-east-1`, `us-west-2`, or `eu-west-1`)
- An S3 bucket for raw MIME storage
- An SNS topic for inbound notifications
- An SES receipt rule routing your domain to S3 + SNS
- An MX record pointing your domain to SES inbound

The easiest way to set all this up is the CLI wizard:

```bash
pigeons setup aws --domain yourdomain.com
```

## Manual SES Setup

### 1. S3 bucket

Create a bucket (e.g. `pigeons-inbound-yourdomain-com`) with a policy allowing SES to write objects:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "AllowSESPut",
    "Effect": "Allow",
    "Principal": {"Service": "ses.amazonaws.com"},
    "Action": "s3:PutObject",
    "Resource": "arn:aws:s3:::pigeons-inbound-yourdomain-com/*",
    "Condition": {"StringEquals": {"AWS:SourceAccount": "123456789012"}}
  }]
}
```

Set these environment variables:

```
PIGEONS_INBOUND_S3_BUCKET=pigeons-inbound-yourdomain-com
PIGEONS_INBOUND_S3_KEY_PREFIX=inbound/
```

### 2. SNS topic

Create an SNS topic (e.g. `pigeons-inbound-yourdomain-com`) and subscribe it to your Pigeons server:

```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:123456789:pigeons-inbound-yourdomain-com \
  --protocol https \
  --endpoint https://pigeons.yourdomain.com/v1/internal/ses/inbound
```

### 3. SES receipt rule

Create a receipt rule set and rule:

```bash
# Create rule set (one-time)
aws ses create-receipt-rule-set --rule-set-name pigeons-inbound
aws ses set-active-receipt-rule-set --rule-set-name pigeons-inbound

# Create rule for your domain
aws ses create-receipt-rule \
  --rule-set-name pigeons-inbound \
  --rule '{
    "Name": "pigeons-yourdomain-com",
    "Enabled": true,
    "Recipients": ["yourdomain.com"],
    "Actions": [
      {"S3Action": {"BucketName": "pigeons-inbound-yourdomain-com", "ObjectKeyPrefix": "inbound/"}},
      {"SNSAction": {"TopicArn": "arn:aws:sns:us-east-1:123456789:pigeons-inbound-yourdomain-com", "Encoding": "UTF-8"}}
    ],
    "ScanEnabled": true
  }'
```

### 4. MX record

Point your domain to SES inbound:

```
MX  yourdomain.com  →  10 inbound-smtp.us-east-1.amazonaws.com
```

## Create an Inbox

```bash
curl -X POST http://localhost:3891/v1/inboxes \
  -H "x-api-key: pgn_..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Support",
    "emailAddress": "support@yourdomain.com",
    "description": "Customer support inbox",
    "webhookUrl": "https://your-app.com/webhooks/email"
  }'
```

```typescript
const inbox = await pigeons.inboxes.create({
  name: 'Support',
  emailAddress: 'support@yourdomain.com',
  webhookUrl: 'https://your-app.com/webhooks/email',
})
```

The `emailAddress` must belong to a domain with inbound capabilities configured.

## Webhook Delivery

When a message arrives, Pigeons fires a webhook to the inbox's `webhookUrl` (if set) and to any globally registered webhooks subscribed to `inbox.message.received`.

Webhook payload:

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

## Threading

Pigeons automatically threads messages using email headers:

1. **In-Reply-To** / **References** headers  -  standard email threading
2. **Subject matching**  -  messages with the same subject and participants are grouped

Each thread tracks:

| Field | Description |
|---|---|
| `id` | Thread ID (`thr_...`) |
| `subject` | Thread subject |
| `lastMessageAt` | Timestamp of the most recent message |
| `messageCount` | Number of messages in the thread |
| `participants` | Array of `{ email, name? }` |
| `status` | `open`, `closed`, or `snoozed` |

### List threads

```bash
curl "http://localhost:3891/v1/inboxes/inb_abc123.../threads?status=open" \
  -H "x-api-key: pgn_..."
```

### Get messages in a thread

```bash
curl "http://localhost:3891/v1/inboxes/inb_abc123.../messages?thread_id=thr_def456..." \
  -H "x-api-key: pgn_..."
```

### Update thread status

```bash
curl -X PATCH http://localhost:3891/v1/inboxes/inb_abc123.../threads/thr_def456... \
  -H "x-api-key: pgn_..." \
  -H "Content-Type: application/json" \
  -d '{"status": "closed"}'
```

## Send from an Inbox

Reply to a message or start a new conversation:

```bash
curl -X POST http://localhost:3891/v1/inboxes/inb_abc123.../messages \
  -H "x-api-key: pgn_..." \
  -H "Content-Type: application/json" \
  -d '{
    "to": "customer@example.com",
    "subject": "Re: Help with my order",
    "html": "<p>Thanks for reaching out. Let me look into order #123.</p>",
    "inReplyTo": "imsg_previous..."
  }'
```

The `inReplyTo` field maintains threading. When set, the outbound message is added to the same thread as the referenced message.

## Reply Extraction

Inbound messages include both the full content and extracted content:

| Field | Description |
|---|---|
| `html` | Full HTML body |
| `text` | Full plain text body |
| `extractedHtml` | Just the new reply (quoted text stripped) |
| `extractedText` | Just the new reply as plain text |

Use the `extracted*` fields to show only the new content without quoted reply chains.

## Catch-All Inbox

Designate one inbox as the catch-all to receive messages that don't match any other inbox:

```bash
curl -X POST http://localhost:3891/v1/inboxes/inb_abc123.../catch-all \
  -H "x-api-key: pgn_..."
```

Only one inbox can be catch-all at a time. Setting a new catch-all removes the flag from the previous one.

When an inbound email arrives for an address that doesn't match any inbox's `emailAddress`, it routes to the catch-all inbox. If no catch-all is configured, unmatched messages are discarded.

## Pause and Resume

```bash
# Pause  -  stops accepting new messages
curl -X POST http://localhost:3891/v1/inboxes/inb_abc123.../pause -H "x-api-key: pgn_..."

# Resume
curl -X POST http://localhost:3891/v1/inboxes/inb_abc123.../resume -H "x-api-key: pgn_..."
```

Paused inboxes still receive email at the SES level, but Pigeons does not store or process the messages.

## Message Attachments

Inbound messages with attachments include an `attachments` array:

```json
{
  "attachments": [
    {
      "filename": "invoice.pdf",
      "contentType": "application/pdf",
      "size": 45231,
      "s3Key": "inbound/attachment/..."
    }
  ]
}
```

The `s3Key` can be used to download the attachment from the inbound S3 bucket.

---
title: Self-Hosting
description: Deploy Pigeons with Docker, configure AWS SES, and harden for production.
---

## Docker

```bash
docker run -d \
  --name pigeons \
  -p 3891:3891 \
  -v pigeons-data:/data \
  -e PIGEONS_DATABASE_URL=file:/data/pigeons.db \
  -e PIGEONS_AWS_ACCESS_KEY_ID=AKIA... \
  -e PIGEONS_AWS_SECRET_ACCESS_KEY=... \
  -e PIGEONS_AWS_REGION=us-east-1 \
  -e PIGEONS_FROM_EMAIL=noreply@yourdomain.com \
  -e PIGEONS_CONFIGURATION_SET=pigeons-tracking \
  ghcr.io/pigeons-dev/pigeons
```

On first start, Pigeons runs migrations, creates a default API key, and prints it to stdout. The key starts with `pgn_` and won't be shown again.

### Docker Compose

```yaml
services:
  pigeons:
    image: ghcr.io/pigeons-dev/pigeons
    ports:
      - "3891:3891"
    volumes:
      - pigeons-data:/data
    environment:
      PIGEONS_DATABASE_URL: file:/data/pigeons.db
      PIGEONS_AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      PIGEONS_AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
      PIGEONS_AWS_REGION: us-east-1
      PIGEONS_FROM_EMAIL: noreply@yourdomain.com
      PIGEONS_CONFIGURATION_SET: pigeons-tracking
    restart: unless-stopped

volumes:
  pigeons-data:
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PIGEONS_PORT` | No | `3891` | HTTP server port |
| `PIGEONS_DATABASE_URL` | No | in-memory | SQLite database URL. Use `file:/path/to/pigeons.db` for persistence |
| `PIGEONS_AWS_ACCESS_KEY_ID` | Yes | | AWS access key for SES |
| `PIGEONS_AWS_SECRET_ACCESS_KEY` | Yes | | AWS secret key for SES |
| `PIGEONS_AWS_REGION` | Yes | | AWS region (e.g. `us-east-1`) |
| `PIGEONS_FROM_EMAIL` | Yes | | Default sender email address |
| `PIGEONS_API_KEY` | No | auto-generated | Pre-set API key instead of auto-generating |
| `PIGEONS_WEBHOOK_SECRET` | No | | Default webhook signing secret |
| `PIGEONS_CONFIGURATION_SET` | No | | SES configuration set name for event tracking |
| `PIGEONS_WORKER_POLL_INTERVAL` | No | `1000` | Job queue poll interval in milliseconds |
| `PIGEONS_INBOUND_S3_BUCKET` | No | | S3 bucket for inbound email storage |
| `PIGEONS_INBOUND_S3_KEY_PREFIX` | No | | S3 key prefix for inbound emails (e.g. `inbound/`) |
| `PIGEONS_OPEN_TRACKING` | No | `false` | Enable open tracking globally |
| `PIGEONS_BASE_URL` | No | | Public base URL of this server (required for open tracking) |

## AWS SES Setup

Pigeons requires AWS SES for sending (and optionally receiving) email. You need:

1. An AWS account with SES access
2. IAM credentials with `ses:SendEmail`, `ses:SendRawEmail` permissions
3. A verified domain in SES
4. A configuration set for delivery event tracking

### Automated setup

The CLI wizard provisions all AWS resources in one command:

```bash
npx @pigeons/cli setup aws
```

It creates the SES domain identity, configuration set, SNS topics, S3 bucket (for inbound), and receipt rules. At the end it prints the DNS records to add and the environment variables to set.

Options:

```bash
npx @pigeons/cli setup aws \
  --region us-east-1 \
  --domain yourdomain.com \
  --access-key-id AKIA... \
  --secret-access-key ... \
  --skip-inbound  # skip inbound email setup
```

### Manual setup

If you prefer manual setup:

1. **Create SES domain identity** - verify your domain in the SES console
2. **Add DNS records** - DKIM CNAMEs, SPF TXT, DMARC TXT (see [Domains](/docs/domains))
3. **Create configuration set** - named `pigeons-tracking` (or any name, set via `PIGEONS_CONFIGURATION_SET`)
4. **Create SNS topic** for delivery events - subscribe it to `POST https://your-server/v1/internal/ses/events`
5. **Add SNS event destination** to the configuration set, matching events: `SEND`, `DELIVERY`, `BOUNCE`, `COMPLAINT`
6. **(Inbound only)** Create S3 bucket, SNS topic, and SES receipt rule (see [Inboxes](/docs/inboxes))

### SES Sandbox

New SES accounts start in sandbox mode. In sandbox:

- You can only send to verified email addresses
- You can send to SES simulator addresses: `success@simulator.amazonses.com`, `bounce@simulator.amazonses.com`, `complaint@simulator.amazonses.com`

Request production access through the AWS console when you're ready to send to any address.

## Production Checklist

### HTTPS

Pigeons itself serves HTTP. Put it behind a reverse proxy (nginx, Caddy, Traefik) for TLS:

```nginx
server {
    listen 443 ssl;
    server_name pigeons.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:3891;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Set `PIGEONS_BASE_URL=https://pigeons.yourdomain.com` so open tracking pixels and links resolve correctly.

### Persistent storage

Always mount a volume for the database. Without it, data is lost when the container restarts:

```bash
-v pigeons-data:/data
-e PIGEONS_DATABASE_URL=file:/data/pigeons.db
```

### Monitoring

- `GET /health` returns `{ "status": "ok", "version": "0.1.0" }` - use this for health checks
- Watch Docker logs for job queue errors and delivery failures
- Set up a webhook for `email.bounced` and `email.complained` events to monitor deliverability

### SNS subscription

After starting the server, subscribe your SNS topics to the Pigeons endpoints:

```bash
# Delivery events (bounces, complaints, deliveries)
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:123456789:pigeons-events-yourdomain \
  --protocol https \
  --endpoint https://pigeons.yourdomain.com/v1/internal/ses/events

# Inbound email notifications
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:123456789:pigeons-inbound-yourdomain \
  --protocol https \
  --endpoint https://pigeons.yourdomain.com/v1/internal/ses/inbound
```

SNS will send a confirmation request to these endpoints. Pigeons handles confirmation automatically.

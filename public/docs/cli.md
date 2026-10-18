---
title: CLI
description: Manage your Pigeons instance from the command line.
---

## Install

```bash
# Run directly
npx @pigeons/cli <command>

# Or install globally
npm install -g @pigeons/cli
pigeons <command>
```

## Configuration

The CLI resolves credentials in this order:

1. **Flags** - `--url` and `--api-key` passed to the command
2. **Environment variables** - `PIGEONS_URL` and `PIGEONS_API_KEY`
3. **Config file** - `~/.config/pigeons/config.json`

### Login

Store your server URL and API key in the config file:

```bash
pigeons login --url https://pigeons.yourdomain.com
```

You'll be prompted for your API key. Credentials are saved to `~/.config/pigeons/config.json`.

### Check connection

```bash
pigeons whoami
```

Verifies the API key is valid and prints the key name and scopes.

### Status

```bash
pigeons status
```

Shows server health, domain verification status, and recent email activity.

---

## Commands

### send

Send a single email:

```bash
pigeons send \
  --to alice@example.com \
  --subject "Hello from Pigeons" \
  --html "<h1>Hello!</h1>"
```

Options:

| Flag | Required | Description |
|---|---|---|
| `--to <email>` | Yes | Recipient address |
| `--subject <text>` | Yes | Subject line |
| `--from <email>` | No | Sender address (uses server default) |
| `--html <html>` | Conditional | HTML body (required if no `--text`) |
| `--text <text>` | Conditional | Plain text body (required if no `--html`) |

### emails

```bash
pigeons emails list              # list recent emails
pigeons emails get <id>          # get email details
```

### domains

```bash
pigeons domains add <domain>     # add a new domain
pigeons domains list             # list all domains
pigeons domains verify <id>      # re-check DNS verification
```

When you add a domain, Pigeons registers it with SES and returns the DNS records you need to add. Run `verify` after adding the records to confirm verification.

### contacts

```bash
pigeons contacts list            # list contacts
pigeons contacts list --tag vip  # filter by tag
```

### templates

```bash
pigeons templates list           # list all templates
```

### campaigns

```bash
pigeons campaigns list           # list campaigns
pigeons campaigns list --status draft  # filter by status
```

### sequences

```bash
pigeons sequences list           # list sequences
```

### webhooks

```bash
pigeons webhooks list            # list webhooks
```

### topics

```bash
pigeons topics list              # list subscription topics
```

### inboxes

```bash
pigeons inboxes list             # list inboxes
```

### setup aws

Provision all AWS resources needed for a Pigeons instance:

```bash
pigeons setup aws
```

The wizard interactively collects your AWS credentials, region, and domain, then creates:

- SES domain identity with DKIM
- SES configuration set (`pigeons-tracking`)
- SNS topic for delivery events
- S3 bucket for inbound emails (unless `--skip-inbound`)
- SNS topic for inbound notifications
- SES receipt rule set and rule

At the end it prints:
- DNS records to add (DKIM CNAMEs, SPF, MX, DMARC)
- Environment variables to set
- SNS topic ARNs to subscribe to your server

Options:

```bash
pigeons setup aws \
  --region us-east-1 \
  --domain yourdomain.com \
  --access-key-id AKIA... \
  --secret-access-key ... \
  --skip-inbound
```

SES inbound email is only available in `us-east-1`, `us-west-2`, and `eu-west-1`. If you choose another region, inbound setup is automatically skipped.

---

## Global Options

Every command accepts:

| Flag | Description |
|---|---|
| `--url <url>` | Override the Pigeons instance URL |
| `--api-key <key>` | Override the API key |

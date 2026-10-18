# MCP Server

## Overview

The Pigeons MCP (Model Context Protocol) server exposes Pigeons operations as tools that LLM agents can call. This lets Claude, GPT, and other agents send emails, manage contacts, read inboxes, and run campaigns through natural language.

## Install

```bash
npm install -g @pigeons/mcp
```

## Configure in Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "pigeons": {
      "command": "npx",
      "args": ["-y", "@pigeons/mcp", "--url", "https://pigeons.yourdomain.com", "--api-key", "pgn_your_key_here"]
    }
  }
}
```

Or use environment variables:

```json
{
  "mcpServers": {
    "pigeons": {
      "command": "npx",
      "args": ["-y", "@pigeons/mcp"],
      "env": {
        "PIGEONS_URL": "https://pigeons.yourdomain.com",
        "PIGEONS_API_KEY": "pgn_your_key_here"
      }
    }
  }
}
```

## Configure in Claude Code

Add to your project's `.claude/settings.json` or global settings:

```json
{
  "mcpServers": {
    "pigeons": {
      "command": "npx",
      "args": ["-y", "@pigeons/mcp"],
      "env": {
        "PIGEONS_URL": "https://pigeons.yourdomain.com",
        "PIGEONS_API_KEY": "pgn_your_key_here"
      }
    }
  }
}
```

## Available Tools

### Email tools

| Tool | Description |
|---|---|
| `send_email` | Send a transactional email with HTML/text or a template |
| `get_email` | Get email details and delivery status by ID |
| `list_emails` | List sent emails with optional status filtering |

### Inbox tools

| Tool | Description |
|---|---|
| `create_inbox` | Create a new agent inbox with a real email address |
| `list_inboxes` | List all agent inboxes |
| `get_inbox_messages` | Get messages for an inbox, optionally filtered by thread or direction |
| `get_thread` | Get a full conversation thread |
| `reply_to_message` | Send a reply from an inbox, maintaining the conversation thread |
| `update_thread_status` | Update thread status (open, closed, snoozed) |

### Contact tools

| Tool | Description |
|---|---|
| `create_contact` | Create a new contact |
| `search_contacts` | List contacts with tag or email filtering |
| `update_contact` | Update a contact's properties, tags, or name |

### Template tools

| Tool | Description |
|---|---|
| `list_templates` | List available email templates |
| `preview_template` | Render a template with sample data |

### Campaign tools

| Tool | Description |
|---|---|
| `create_campaign` | Create a draft email campaign |
| `list_campaigns` | List campaigns with optional status filter |
| `get_campaign` | Get campaign details and statistics |
| `send_campaign` | Send or schedule a campaign |
| `cancel_campaign` | Cancel a sending or scheduled campaign |

### Sequence tools

| Tool | Description |
|---|---|
| `create_sequence` | Create a multi-step email sequence |
| `list_sequences` | List sequences |
| `get_sequence` | Get sequence details with steps and stats |
| `activate_sequence` | Activate a sequence |
| `pause_sequence` | Pause an active sequence |
| `enroll_in_sequence` | Enroll a contact in a sequence |

### Topic tools

| Tool | Description |
|---|---|
| `create_topic` | Create a subscription topic |
| `list_topics` | List subscription topics |
| `get_topic` | Get topic details |
| `delete_topic` | Delete a topic |

## Resources

The MCP server also exposes read-only resources:

| Resource URI | Description |
|---|---|
| `pigeons://inboxes` | All agent inboxes and their email addresses |
| `pigeons://templates` | Available templates with slugs and variable schemas |
| `pigeons://domains` | Verified sending domains and their status |

## Example Prompts

Once configured, you can ask your LLM agent:

- "Send a welcome email to alice@example.com using the welcome-email template"
- "Check the status of email msg_abc123"
- "Show me all undelivered emails from today"
- "Create an inbox for support@mycompany.com"
- "Read the latest messages in the support inbox"
- "Reply to the customer in thread thr_xyz saying we'll look into it"
- "Create a campaign called 'Product Launch' targeting contacts tagged with 'beta'"
- "What are the delivery stats for the Product Launch campaign?"
- "Create an onboarding sequence with a welcome email, 1-day delay, then a getting-started email"
- "Enroll contact ctc_abc123 in the onboarding sequence"

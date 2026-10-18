# Domains

## Add a Domain

Register a domain with Pigeons and SES:

```bash
curl -X POST http://localhost:3891/v1/domains \
  -H "x-api-key: pgn_..." \
  -H "Content-Type: application/json" \
  -d '{"domain": "yourdomain.com"}'
```

Or via the CLI:

```bash
pigeons domains add yourdomain.com
```

Pigeons calls `CreateEmailIdentity` on SES, which returns DKIM tokens. The response includes the full list of DNS records you need to add.

## DNS Records

After adding a domain, you need to configure these DNS records:

### DKIM (required)

Three CNAME records for email authentication. The exact values come from the domain response:

```
CNAME  token1._domainkey.yourdomain.com  →  token1.dkim.amazonses.com
CNAME  token2._domainkey.yourdomain.com  →  token2.dkim.amazonses.com
CNAME  token3._domainkey.yourdomain.com  →  token3.dkim.amazonses.com
```

### SPF (required)

A TXT record authorizing SES to send on your behalf:

```
TXT  mail.yourdomain.com  →  "v=spf1 include:amazonses.com ~all"
```

### DMARC (recommended)

A TXT record for DMARC policy. Start with `quarantine` and tighten to `reject` once deliverability is confirmed:

```
TXT  _dmarc.yourdomain.com  →  "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"
```

### MX for outbound feedback

An MX record for bounce feedback:

```
MX  mail.yourdomain.com  →  10 feedback-smtp.us-east-1.amazonses.com
```

Replace `us-east-1` with your SES region.

### MX for inbound (optional)

If you want to receive email through Pigeons inboxes:

```
MX  yourdomain.com  →  10 inbound-smtp.us-east-1.amazonaws.com
```

Inbound MX is only available in `us-east-1`, `us-west-2`, and `eu-west-1`.

## Verification

After adding DNS records, trigger a verification check:

```bash
curl http://localhost:3891/v1/domains/dom_abc123.../verify \
  -H "x-api-key: pgn_..."
```

Or:

```bash
pigeons domains verify dom_abc123...
```

Pigeons queries SES for the identity's current verification state and updates the stored status. DNS propagation typically takes 5-10 minutes, but can take up to 72 hours.

The domain object tracks three verification fields:

| Field | Description |
|---|---|
| `verificationStatus` | Overall status: `pending`, `verified`, or `failed` |
| `spfVerified` | Whether SPF record is detected |
| `dmarcVerified` | Whether DMARC record is detected |

## Domain Stats

Check sending metrics for a domain:

```bash
curl http://localhost:3891/v1/domains/dom_abc123.../stats \
  -H "x-api-key: pgn_..."
```

Returns delivery rates, bounce rates, and warmup guidance across three time windows (24h, 7d, 30d).

## Region Considerations

Each domain is associated with an AWS region. SES treats each region as a separate sending environment:

- Sending reputation is per-region
- Sandbox status is per-region
- Inbound email is only available in `us-east-1`, `us-west-2`, and `eu-west-1`
- DKIM tokens are region-specific

If you need to send from multiple regions, add the same domain in each region. DNS records may differ.

## SES Sandbox vs Production

New SES accounts start in **sandbox mode** per region. In sandbox:

- You can only send to verified email addresses
- Daily sending limit: 200 emails
- Maximum send rate: 1 email per second
- You can test with SES simulator addresses:
  - `success@simulator.amazonses.com`  -  simulates successful delivery
  - `bounce@simulator.amazonses.com`  -  simulates a hard bounce
  - `complaint@simulator.amazonses.com`  -  simulates a complaint

To move out of sandbox, request production access in the AWS console for your region. AWS reviews the request (typically 24 hours) and evaluates your sending use case.

## Capabilities

When adding a domain, you can specify capabilities:

```json
{
  "domain": "yourdomain.com",
  "capabilities": {
    "sending": true,
    "receiving": false
  }
}
```

- `sending: true`  -  domain can be used as a `from` address (default)
- `receiving: true`  -  domain accepts inbound email through Pigeons inboxes (requires MX record and SES receipt rule)

## Delete a Domain

```bash
curl -X DELETE http://localhost:3891/v1/domains/dom_abc123... \
  -H "x-api-key: pgn_..."
```

This removes the domain from Pigeons and deletes the SES identity. DNS records should be cleaned up manually.

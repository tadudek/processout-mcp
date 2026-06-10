# Agent Notes: ProcessOut MCP vs Demo App

This repo is the standalone ProcessOut MCP server. Do not assume it is the same
codebase as the ProcessOut demo/webhook app.

## Separation of responsibilities

- `processout-mcp/mcp-server-web` is the MCP/API helper. It can run locally and
  expose SSE/HTTP MCP endpoints for agents.
- `https://processout-demo.cirsiumlabs.io` is the separate ProcessOut demo app
  and webhook receiver.
- Use the MCP where it helps inspect or act on ProcessOut API resources, but do
  not deploy this MCP package over the demo app.

## Local MCP operation

From `mcp-server-web`:

```bash
npm run build
npm run start:web
```

Expected health check:

```bash
curl -sS http://127.0.0.1:3000/health
```

Expected response:

```json
{"status":"OK","server":"processout-api","version":"1.0.3"}
```

MCP endpoints:

- `GET /health`
- `GET /sse`
- `POST /api/messages?sessionId=...`

Important local/demo distinction:

- The local MCP server does not implement `/demo-webhook` or
  `/api/demo-webhook`; those routes should return `404` here.
- A local webhook failure against `localhost:3000/demo-webhook` usually means
  the wrong local app is running. It is not evidence that the published demo
  webhook receiver is broken.

Useful local checks:

```bash
curl -sS -i http://127.0.0.1:3000/health
curl -sS -i http://127.0.0.1:3000/demo-webhook
curl -sS -i http://127.0.0.1:3000/api/demo-webhook
```

Expected local shape:

- `/health` returns `200` with `processout-api`.
- `/demo-webhook` and `/api/demo-webhook` return `404`.

## Checking published webhook updates

Use the Vercel CLI against the published demo app, not the MCP server, when the
user asks for recent webhook activity on `processout-demo.cirsiumlabs.io`.

Status endpoints:

```bash
curl -sS -i https://processout-demo.cirsiumlabs.io/demo-webhook
curl -sS -i https://processout-demo.cirsiumlabs.io/api/demo-webhook
```

Expected healthy published shape:

```json
{"ok":true,"receiver":"processout-demo-webhook","accepts":["POST"],"eventCount":0,"eventsProtected":true}
```

Note: `eventCount: 0` can still appear even when recent webhook POSTs exist,
because events are protected or not persisted in that public status response.
Use Vercel runtime logs for the actual recent webhook updates.

Commands that worked for recent webhook inspection:

```bash
npx vercel@latest inspect processout-demo.cirsiumlabs.io
npx vercel@latest logs processout-demo.cirsiumlabs.io --since 24h
npx vercel@latest logs processout-demo.cirsiumlabs.io --since 2h --query "/demo-webhook" --expand --limit 30
```

The useful fields in expanded logs are:

- `stage`: for example `webhook-received`, `webhook-status-query`, or
  `payment-data-refreshed`.
- `eventId` and `fingerprint.eventName`: for example
  `transaction.requested`, `transaction.authorized`,
  `transaction.operation.capture.pending`, or `transaction.captured`.
- `invoiceId`, `transactionId`, `appRefId`.
- `fingerprint.status`, `amount`, `currency`, `gatewayName`,
  `operationPaymentType`, `authorized`, `captured`, and
  `completeness`.

Known successful published example from June 10, 2026:

- Last completed transaction path was around `2026-06-10T15:46:42Z`
  (`09:46:42 MDT`) on Vercel.
- Final webhook: `transaction.captured`.
- Event ID: `ev_ig4M0LQTiFTX0UgkREjBccyFFd65FSPT`.
- Invoice: `iv_3Ex36C2pC1xXqH8g1GRtFatGo5JdPY8v`.
- Transaction: `tr_3Ex37C2pC10D9sTw0Yk8fijaqx5f5TTA`.
- App ref: `CAT-DEMO-1781106221179-IA2XAO`.
- Status: `completed`; amount: `10 MXN`.
- Gateway: `mercadopagomxcashinaccount`.
- Payment type: `mercadopagowallet`.
- `authorized: true`, `captured: true`, `completeness.complete: true`,
  `missing: []`, `errors: []`.

## Mercado Pago direct query helpers

The separate demo app lives at `/Users/tim/processout-wallet-demo`. It has
server-side helpers for querying Mercado Pago directly:

- `GET /demo-mercadopago-search`
- `GET /demo-mercadopago-payment`

Published URLs:

```bash
https://processout-demo.cirsiumlabs.io/demo-mercadopago-search?reference=CAT-DEMO-...&beginDate=2026-06-09T21:00:00Z&endDate=2026-06-09T21:15:00Z
https://processout-demo.cirsiumlabs.io/demo-mercadopago-payment?paymentId=...
```

Local URLs when the demo app is running locally, usually on port `3001`:

```bash
http://127.0.0.1:3001/demo-mercadopago-search?reference=CAT-DEMO-...&beginDate=2026-06-09T21:00:00Z&endDate=2026-06-09T21:15:00Z
http://127.0.0.1:3001/demo-mercadopago-payment?paymentId=...
```

Auth/token distinction:

- `DEMO_ACCESS_TOKEN` protects the demo API routes. Send it as the
  `x-demo-access-token` header. Do not put it in the URL.
- `DEMO_MERCADOPAGO_ACCESS_TOKEN` or `MERCADOPAGO_ACCESS_TOKEN` is the Mercado
  Pago API token used by the server.
- On localhost only, the Mercado Pago token may also be supplied as
  `x-mercadopago-access-token`; do not use this on the published Vercel app.

Example published API call shape:

```bash
curl -sS \
  -H "x-demo-access-token: $DEMO_ACCESS_TOKEN" \
  "https://processout-demo.cirsiumlabs.io/demo-mercadopago-search?reference=CAT-DEMO-...&beginDate=2026-06-09T21:00:00Z&endDate=2026-06-09T21:15:00Z"
```

The search endpoint logs a `mercadopago-payment-search` attempt into
`/demo-attempts`. The payment lookup endpoint logs
`mercadopago-payment-query`.

## Vercel deployment lesson learned

Do not run `vercel --prod` from this repo unless you are intentionally deploying
the MCP server package and have confirmed the Vercel target is correct.

What went wrong before:

- Deploying from the repo root failed because the root has no `npm run build`.
- Deploying from `mcp-server-web` succeeded, but it served the MCP static test
  client at production.
- That temporarily caused `https://processout-demo.cirsiumlabs.io/demo-webhook`
  to return the MCP test page instead of webhook JSON.
- The demo app was restored by promoting the prior ready Vercel deployment.

Before any future Vercel action:

1. Confirm whether the target is the demo app or the MCP package.
2. Confirm the local folder is linked to the intended Vercel project.
3. Check `/demo-webhook` after deployment if touching the demo app.
4. If `/demo-webhook` returns HTML instead of JSON, stop and restore/promote the
   last known-good demo deployment.

Known-good webhook shape:

```json
{"ok":true,"receiver":"processout-demo-webhook","accepts":["POST"],"eventCount":0,"eventsProtected":true}
```

## ProcessOut setup debugging notes

Recent webhook payloads showed:

- ProcessOut invoice creation and webhook delivery were working.
- Events were `transaction.requested`.
- Transactions were stuck at `status: waiting`.
- The gateway was `mercadopagomxcashinaccount`.
- The operation payment type was `mercadopagowallet`.
- Completeness checks were missing `payment_status`, `email`, and `phone`.

Likely debugging focus:

- Confirm the Mercado Pago sandbox buyer/test account completes the hosted
  payment step.
- Confirm the gateway/sub-account is the intended Mercado Pago Mexico method.
- Include customer email and phone in test invoices when possible.
- Use realistic Mexico billing data for MXN/Mercado Pago tests.

## Local schema note

There is a useful local MCP schema adjustment: invoice `details` should be an
array of line items, not a single object. Preserve that change unless replacing
the generated schema from a newer verified OpenAPI source.

## June 10, 2026 stability diagnosis

The actual demo app is in `/Users/tim/processout-wallet-demo`, not this repo.
The latest Vercel logs showed the published ProcessOut/Mercado Pago path can
complete successfully, but the demo status UI can become misleading.

Observed suspicious pattern:

- A new invoice/app ref was created:
  `CAT-DEMO-1781108191159-P3OB8G` /
  `iv_3Ex76C2pC1ejo4N9kmerNiWaD8fuX7Va`.
- The first status query paired that new invoice/app ref with an old completed
  transaction:
  `tr_3Ex37C2pC10D9sTw0Yk8fijaqx5f5TTA`.
- The correct new transaction later appeared and completed:
  `tr_3Ex76C2pC1dUTzEmd94zGnViCQah9kIg`.

Likely root cause:

- `public/dynamic-checkout-demo.html` builds `/demo-webhook` status URLs from
  `transactionObjectEl.id` before `invoice.transaction_id`. That DOM node can
  retain a previous run's transaction ID while a fresh invoice is being mounted.
- `api/demo-webhook.js` then trusts the supplied `transactionId`, so a stale
  transaction can be combined with a fresh invoice in the returned
  `paymentData`.

Recommended app fixes:

- Add local file-backed JSONL attempt/webhook logs for the local server so local
  testing survives page refreshes and process/serverless instance changes.

Fixed locally in `/Users/tim/processout-wallet-demo` on June 10, 2026:

- Frontend clears stale transaction/completeness state when mounting a new
  invoice.
- Frontend tracks submitted `appRefId`/`altRefId` values in the page session and
  refreshes them before each invoice create attempt, so a used order ID is not
  reused for the next test.
- `buildWebhookStatusUrl` now prefers `invoice.transaction_id` and only includes
  a transaction object ID when it belongs to the current invoice.
- `api/demo-webhook.js` now prefers the invoice's transaction and avoids
  returning a supplied stale transaction for a different invoice.
- Verified with the known stale pair: query invoice
  `iv_3Ex76C2pC1ejo4N9kmerNiWaD8fuX7Va` plus old transaction
  `tr_3Ex37C2pC10D9sTw0Yk8fijaqx5f5TTA`; local `/demo-webhook` returned the
  correct transaction `tr_3Ex76C2pC1dUTzEmd94zGnViCQah9kIg`.

## Local demo webhook through ngrok

The local demo can receive real ProcessOut webhooks if the actual demo app is
running on port `3001` and a public tunnel forwards to it.

Known working shape from June 10, 2026:

```text
https://tangela-hydrotropic-doretha.ngrok-free.dev -> http://localhost:3001
```

Verification commands:

```bash
curl -sS -i http://127.0.0.1:3001/demo-webhook
curl -sS -i https://<ngrok-host>/demo-webhook
```

Both should return JSON with:

```json
{"ok":true,"receiver":"processout-demo-webhook","accepts":["POST"]}
```

Important local testing detail:

- If the checkout page is opened at `http://127.0.0.1:3001`, the default
  webhook URL is local and ProcessOut cannot call it.
- For real end-to-end local webhook tests, open the app through the ngrok host,
  for example `https://<ngrok-host>/dynamic-checkout-demo.html`, or manually set
  the webhook field to `https://<ngrok-host>/demo-webhook`.
- The demo app now supports `DEMO_PUBLIC_WEBHOOK_ORIGIN` or
  `DEMO_WEBHOOK_ORIGIN` in `/Users/tim/processout-wallet-demo/.env.local`; when
  set, `/demo-config` defaults `webhookUrl` to that public origin even if the
  page is opened from `127.0.0.1`.
- Routes such as `/demo-config` are protected when accessed through ngrok
  because the request is no longer considered localhost; use the
  `x-demo-access-token` header from `.env.local`.

## June 10, 2026 Mercado Pago test result and logging

Published Vercel attempt confirmed working on
`https://processout-demo.cirsiumlabs.io`:

- App reference: `CAT-DEMO-1781110874712-15WR0X`
- Invoice: `iv_3ExCXC2pC1mVFgDOyBIscqcdPZ53cLDp`
- Transaction: `tr_3ExCXC2pC1pMrBwFA9auiNOZq6Af0Vpb`
- Mercado Pago payment: `1347131987`
- Card: official MP MX Visa test card ending `3764`, cardholder `APRO`
- MP status: `approved`, `status_detail: accredited`, captured true
- ProcessOut webhooks observed: `transaction.requested`,
  `transaction.operation.capture.pending`, `transaction.captured`
- ProcessOut final status: `completed`, authorized true, captured true,
  completeness true

The earlier Mastercard test card attempt did not create a Mercado Pago payment
for the `CAT-DEMO-...` reference, so ProcessOut stayed at `waiting` with zero
transaction attempts and no gateway error.

Instrumentation added to `/Users/tim/processout-wallet-demo` and deployed to
Vercel deployment `dpl_DYtcbfCidLNuWmULtX7CrganbFUA`:

- `POST /demo-client-event` records Dynamic Checkout browser events into the
  same in-memory attempt log used by `/demo-webhook` and Vercel logs.
- `public/dynamic-checkout-demo.html` posts ProcessOut browser event name,
  source, safe event detail, invoice ID, transaction ID, app reference, URL, and
  user agent to `/demo-client-event`.
- Local server route and Vercel rewrite both include `/demo-client-event`.
- `npm run check` includes `api/demo-client-event.js`.

For the next failed test, read Vercel logs and search for
`stage: 'client-event'` alongside `webhook-received` and
`webhook-status-query`. That should reveal whether Dynamic Checkout emitted
`payment_error`, `payment_cancelled`, or another client-side event before
ProcessOut/MP produced a gateway payment.

Local/ngrok end-to-end success later on June 10, 2026:

- URL tested:
  `https://tangela-hydrotropic-doretha.ngrok-free.dev/dynamic-checkout-demo.html`
- App reference: `CAT-DEMO-1781112220727-DPPIS9`
- Invoice: `iv_3ExFGC2pC1zQxBjygZHk1tHfH2hVnvWj`
- Transaction: `tr_3ExFHC2pC10t0ZexDQTRTyQaU6LzJNAP`
- Mercado Pago payment: `1347132241`
- Card: official MP MX Visa test card ending `3764`, cardholder `APRO`
- MP status: `approved`, `status_detail: accredited`, captured true
- ProcessOut local webhook received `transaction.captured`
- Final ProcessOut status: `completed`, authorized true, captured true,
  completeness true
- Client event: `processout_dynamic_checkout_payment_success`

This proves the local server plus ngrok public return/webhook origin can run a
full hosted Mercado Pago checkout and receive the real ProcessOut capture
webhook back on the local machine.

## Switching demo ProcessOut projects

The demo app reads the active public ProcessOut project ID from
`DEMO_PROCESSOUT_PROJECT_ID`.

Local behavior in `/Users/tim/processout-wallet-demo`:

- `.env` is loaded first.
- `.env.local` is loaded second and overrides `.env`.
- Put the active local project ID in `.env.local`:

```text
DEMO_PROCESSOUT_PROJECT_ID=test-proj_...
```

Then restart:

```bash
npm run dev:local
```

The user's ProcessOut key is valid across the sandbox, so project switching only
requires changing `DEMO_PROCESSOUT_PROJECT_ID` unless a future key has narrower
scope.

Vercel behavior:

- The published project `tim-cirsiumlabs/procesout_demo` has
  `DEMO_PROCESSOUT_PROJECT_ID` configured for Production and Preview.
- To switch the published demo, update the Vercel
  `DEMO_PROCESSOUT_PROJECT_ID` environment variable and redeploy.
- Confirm with protected `/demo-config`; it returns the active `projectId`.

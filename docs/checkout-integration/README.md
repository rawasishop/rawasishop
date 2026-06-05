# RawasiShop Checkout Integration

Standalone checkout: `/checkout/`

## Config file

All keys live in `js/payments-config.js` — replace `YOUR_*` placeholders.

## Payment methods

| Method | Status | Docs |
|--------|--------|------|
| COD (+30 SAR) | ✅ Live | Built-in — WhatsApp + Google Sheets |
| Apple Pay (iOS) | 🔧 Placeholder | [apple-pay.md](./apple-pay.md) |
| Stripe | 🔧 Placeholder | [stripe.md](./stripe.md) |
| Tabby (KSA) | 🔧 Placeholder | [tabby.md](./tabby.md) |
| Tamara (KSA) | 🔧 Placeholder | [tamara.md](./tamara.md) |

## COD logic

- Subtotal = bundle price (395 / 690 / 950 SAR)
- Shipping = free
- COD fee = **+30 SAR** when payment method is `cod`
- Total = subtotal + cod fee

## URL params

- `?bundle=1` or `?qty=2` — pre-select bundle
- `?status=tabby_success` — return from BNPL redirect

## Backend required for

Stripe, Tabby, Tamara, and Apple Pay merchant validation **cannot** run securely on static GitHub Pages alone. You need a small backend (Cloudflare Worker, Vercel, etc.) for:

- Stripe PaymentIntent creation
- Tabby `POST /api/v2/checkout` (secret key)
- Tamara `POST /checkout` (API token)
- Apple Pay merchant session validation

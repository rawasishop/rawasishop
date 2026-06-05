# Tabby Integration (KSA)

## API base

`https://api.tabby.sa` (Saudi Arabia)

## Keys

```js
tabby: {
  merchantCode: 'from Tabby dashboard',
  secretKey: 'Bearer token — backend only'
}
```

## Eligibility check (optional)

`POST /api/v2/checkout` with minimal payload (amount, currency, buyer.phone, buyer.email, merchant_code).

## Full checkout session

When customer selects Tabby and clicks submit:

```json
POST /api/v2/checkout
Authorization: Bearer {secretKey}

{
  "payment": {
    "amount": "425.00",
    "currency": "SAR",
    "buyer": { "name": "...", "email": "...", "phone": "+9665..." },
    "shipping_address": { "city": "...", "address": "...", "zip": "..." },
    "order": { "reference_id": "...", "items": [...] }
  },
  "lang": "ar",
  "merchant_code": "...",
  "merchant_urls": {
    "success": "https://www.rawasishop.com/checkout/?status=tabby_success",
    "cancel": "https://www.rawasishop.com/checkout/?status=tabby_cancel",
    "failure": "https://www.rawasishop.com/checkout/?status=tabby_failure"
  }
}
```

Redirect customer to `configuration.available_products.installments.web_url`.

Ref: https://docs.tabby.ai/api-reference/checkout/create-a-session

# Tamara Integration (KSA)

## API

Sandbox: `https://api-sandbox.tamara.co`  
Production: `https://api.tamara.co`

## Keys

```js
tamara: {
  apiToken: 'Bearer token',
  notificationToken: 'webhook verification'
}
```

## Create checkout session

```json
POST /checkout
Authorization: Bearer {apiToken}

{
  "total_amount": { "amount": 395, "currency": "SAR" },
  "country_code": "SA",
  "order_reference_id": "RS-12345",
  "consumer": { "first_name": "...", "phone_number": "+9665...", "email": "..." },
  "shipping_address": { "city": "...", "line1": "..." },
  "merchant_url": {
    "success": "...",
    "failure": "...",
    "cancel": "..."
  }
}
```

Response: `checkout_url` → redirect customer.

After approval webhook: `POST /orders/{order_id}/authorise`

Ref: https://docs.tamara.co/docs/direct-online-checkout

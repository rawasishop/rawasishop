# Apple Pay (iOS Express Checkout)

## Current behavior

- Express section visible on **iOS / iPadOS** only
- Without Stripe key: native `ApplePaySession` placeholder (needs merchant validation)
- With Stripe key: `PaymentRequestButton` via Stripe.js

## Requirements

1. Stripe account with Apple Pay enabled for Saudi Arabia
2. Domain verification in Stripe Dashboard
3. Backend endpoint for `onvalidatemerchant` → Stripe `applePayDomains`

## Stripe Payment Request (recommended)

```js
const pr = stripe.paymentRequest({
  country: 'SA',
  currency: 'sar',
  total: { label: 'RawasiShop', amount: 42500 }
});
pr.canMakePayment().then(result => { /* mount button */ });
```

Safari on iOS uses Apple Pay automatically.

Ref: https://docs.stripe.com/js/payment_request/create

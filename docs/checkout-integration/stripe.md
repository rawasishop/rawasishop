# Stripe Integration

## Keys (`payments-config.js`)

```js
stripe: {
  publishableKey: 'pk_live_...',  // frontend
  secretKey: 'sk_live_...',       // backend ONLY
  webhookSecret: 'whsec_...'
}
```

## Flow

1. Customer submits card or Apple Pay on `/checkout/`
2. **Backend** creates `PaymentIntent` with amount in halalas (SAR × 100)
3. Frontend confirms with `stripe.confirmCardPayment(clientSecret)` or Payment Request
4. Webhook `payment_intent.succeeded` → fulfill order

## Apple Pay via Stripe

Use `stripe.paymentRequest({ country: 'SA', currency: 'sar', total })` — auto-uses Apple Pay on Safari/iOS.

Ref: https://docs.stripe.com/js/payment_request/create

## Express Checkout Element (alternative)

`checkout.createExpressCheckoutElement({ paymentMethods: { applePay: 'always' } })`

Ref: https://docs.stripe.com/js/custom_checkout/create_express_checkout_element

/* =========================================================
   RawasiShop — Payment provider placeholders
   Replace YOUR_* values before going live.
   ========================================================= */
window.RAWASI_PAYMENTS = {
  currency: 'SAR',
  country: 'SA',
  codFee: 30,

  stripe: {
    publishableKey: 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY',
    // Server-side only — never expose in production frontend bundles from a public repo
    secretKey: 'sk_test_YOUR_STRIPE_SECRET_KEY',
    webhookSecret: 'whsec_YOUR_STRIPE_WEBHOOK_SECRET',
    merchantName: 'RawasiShop',
    merchantCountry: 'SA'
  },

  tabby: {
    apiBase: 'https://api.tabby.sa',
    merchantCode: 'YOUR_TABBY_MERCHANT_CODE',
    secretKey: 'YOUR_TABBY_SECRET_KEY',
    publicKey: 'YOUR_TABBY_PUBLIC_KEY',
    merchantUrls: {
      success: 'https://www.rawasishop.com/checkout/?status=tabby_success',
      cancel: 'https://www.rawasishop.com/checkout/?status=tabby_cancel',
      failure: 'https://www.rawasishop.com/checkout/?status=tabby_failure'
    }
  },

  tamara: {
    apiBase: 'https://api-sandbox.tamara.co',
    apiToken: 'YOUR_TAMARA_API_TOKEN',
    notificationToken: 'YOUR_TAMARA_NOTIFICATION_TOKEN',
    merchantUrls: {
      success: 'https://www.rawasishop.com/checkout/?status=tamara_success',
      failure: 'https://www.rawasishop.com/checkout/?status=tamara_failure',
      cancel: 'https://www.rawasishop.com/checkout/?status=tamara_cancel'
    }
  },

  store: {
    whatsapp: '212633405061',
    sheetWebhook: 'https://script.google.com/macros/s/AKfycbxABILHb7m188O7OqdBKifjavrcxvvRuH9KH66Q1-jil5_rv8yBR4Jgks0bqd1UHdw/exec',
    fbPixelId: '1007677050990489'
  }
};

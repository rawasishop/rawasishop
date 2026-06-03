# لوحة تحكم + Backend (غير مضمنة في هذا المستودع)

المتجر الحالي **static** (HTML + JS + Google Sheets). لبناء Admin كما في StreamKiller/Nama Store تحتاج:

## Backend مقترح
- Node/Express أو Next.js API
- PostgreSQL: `orders`, `order_items`, `tracking_events`
- MaxMind + VPN detection على `/api/track` و `/api/order`

## متغيرات بيئة مثال
```
ADMIN_USER=admin
ADMIN_PASSWORD=your-strong-password
DATABASE_URL=postgresql://...
MAXMIND_LICENSE_KEY=...
WEBHOOK_SHEET_URL=https://script.google.com/macros/s/AKfycbyrfes6PlsGclbOvj0MVFITDhYX3zT4bA-lkS7KGs3_oQGUP3bAiMwgHFI7HvC5X61y/exec
```

## SQL migration (مختصر)
انظر ملف `docs/schema.sql` عند إنشاء Backend.

## ما تم في الفرونت الآن
- سلة → إغلاق السلة → Checkout فقط (بدون تداخل)
- زر تأكيد **دائماً قابل للنقر** + `reportValidity()`
- Upsell يظهر وحده ثم **thank-you.html** (السلة والـ checkout مغلقان)
- Webhook بصيغة Sheet في `google-apps-script-webhook.js`

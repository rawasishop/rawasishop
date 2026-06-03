# ربط طلبات رواسي بـ Google Sheets

## جدولك
https://docs.google.com/spreadsheets/d/1fK5x1DqQYpijlbmGPWqhlw6S7xUb-Drojwue3dfigFE/edit

معرّف الجدول (للمرجع): `1fK5x1DqQYpijlbmGPWqhlw6S7xUb-Drojwue3dfigFE`

## الأعمدة (الصف الأول)

| date | orderid | country | name | phone | product | sku | quantity | total price | currency | status |
|------|---------|---------|------|-------|---------|-----|----------|-------------|----------|--------|

## خطوات الربط (5 دقائق)

1. افتح الرابط أعلاه بحساب Google الذي تملك الجدول به.
2. **Extensions** → **Apps Script**.
3. انسخ محتوى الملف `google-apps-script-webhook.js` من المشروع والصقه في المحرر → **Save**.
4. من القائمة اختر الدالة **`setupHeaders`** → **Run** → اسمح بالصلاحيات (أول مرة).
5. **Deploy** → **New deployment** → أيقونة الترس → **Web app**:
   - **Execute as:** Me  
   - **Who has access:** Anyone  
6. انسخ **Web app URL** (ينتهي بـ `/exec`).
7. في `js/config.js` ضع الرابط:

```javascript
WEBHOOK_URL: 'https://script.google.com/macros/s/AKfycbyrfes6PlsGclbOvj0MVFITDhYX3zT4bA-lkS7KGs3_oQGUP3bAiMwgHFI7HvC5X61y/exec',
```

(مضبوط في `js/config.js`)

8. ارفع الموقع أو جرّب محلياً: أتمم طلب تجريبي وتحقق من صف جديد في الجدول.

## اختبار

- افتح في المتصفح: `https://script.google.com/macros/s/XXXX/exec`  
  يجب أن ترى: `Rawasi webhook OK`
- إذا لم يظهر صف بعد الطلب: تأكد أن `WEBHOOK_URL` ينتهي بـ `/exec` وليس `/dev`.

## ملاحظة

الموقع يرسل الطلب بـ `mode: 'no-cors'` — لا ترى رسالة خطأ في المتصفح حتى لو فشل الرابط. الاعتماد على ظهور الصف في الجدول.

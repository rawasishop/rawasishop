# إعداد تيليغرام لاستلام الطلبات — RawasiShop

## كيف يخدم النظام؟

1. الزبونة تملأ النموذج في الموقع
2. الطلب يُرسل تلقائياً إلى **Google Sheets** + **تيليغرام**
3. **لا يُفتح واتساب** للزبونة بعد الطلب (إلا إذا غيّرت `openWhatsAppOnOrder` إلى `true`)

---

## خطوة 1 — Google Sheets + Apps Script

1. افتح جدول Google Sheets الخاص بالطلبات
2. **Extensions → Apps Script**
3. الصق محتوى ملف `google-apps-script.gs` من المشروع
4. احفظ المشروع

---

## خطوة 2 — تفعيل الأذونات (مرة واحدة)

1. في Apps Script اختر الدالة **`authorizeAll`**
2. اضغط **Run / Exécuter**
3. وافق على كل الأذونات (Google Sheets + UrlFetch لـ Telegram)

---

## خطوة 3 — النشر (Deploy)

1. **Déployer → Nouvelle version**
2. Type: **Application Web**
3. Exécuter en tant que: **Moi**
4. Qui a accès: **Tout le monde** (مهم جداً)
5. انسخ رابط **URL** الكامل

---

## خطوة 4 — ربط الموقع

في `js/taager-config.js`:

```javascript
sheetWebhook: 'الرابط_الكامل_من_Google',
openWhatsAppOnOrder: false,
orderNotify: 'telegram',
```

---

## اختبار التيليغرام

افتح في المتصفح:

```
رابط_الويب_هوك?test=telegram
```

يجب أن تصلك رسالة: `✅ RawasiShop: التنبيهات تعمل.`

اختبار طلب كامل:

```
رابط_الويب_هوك?test=order
```

---

## البوت الحالي

- **البوت:** `@rawasishop_orders_bot`
- **Chat ID:** `6242287291`

---

## مشاكل شائعة

| المشكل | الحل |
|--------|------|
| 404 على الرابط | انسخ الرابط كاملاً بدون قصّه |
| الجدول يعمل والتيليغرام لا | نفّذ `authorizeAll` مرة أخرى |
| لا شيء يصل | تأكد أن النشر **Tout le monde** |
| واتساب ما زال يفتح | تأكد `openWhatsAppOnOrder: false` وانشر الموقع |

---

## العودة لواتساب

غيّر في `taager-config.js`:

```javascript
openWhatsAppOnOrder: true,
```

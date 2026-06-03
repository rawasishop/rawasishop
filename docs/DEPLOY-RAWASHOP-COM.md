# نشر الموقع على rawasishop.com

المستودع: https://github.com/rawasishop/rawasishop  
النطاق مربوط عبر ملف `CNAME` → `rawasishop.com`

## 1) GitHub Pages (مرة واحدة)

1. افتح: https://github.com/rawasishop/rawasishop/settings/pages  
2. **Build and deployment** → Source: **Deploy from a branch**  
3. Branch: **main** — Folder: **/ (root)**  
4. احفظ. بعد دقائق يظهر الموقع على `https://rawasishop.github.io` ثم على النطاق المخصص.

## 2) DNS عند مسجّل النطاق (GoDaddy / Namecheap / …)

### للنطاق الجذر `rawasishop.com` (موصى به مع GitHub)

| النوع | الاسم | القيمة |
|--------|--------|--------|
| A | @ | `185.199.108.153` |
| A | @ | `185.199.109.153` |
| A | @ | `185.199.110.153` |
| A | @ | `185.199.111.153` |

### لـ `www` (اختياري)

| النوع | الاسم | القيمة |
|--------|--------|--------|
| CNAME | www | `rawasishop.github.io` |

في GitHub → Settings → Pages → **Custom domain** أضف `rawasishop.com` وفعّل **Enforce HTTPS**.

## 3) تحديث الموقع بعد أي تعديل

```bash
git add .
git commit -m "وصف التعديل"
git push origin main
```

التحديث يظهر عادة خلال 1–3 دقائق.

## 4) إن بقي الموقع القديم

- امسح كاش المتصفح أو جرّب نافذة خاصة  
- تحقق أن آخر commit على GitHub يحتوي `index.html` الجديد (مكملات الحر والغبار)

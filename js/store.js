/* ===================================================================
   رواسي — One Product Landing order flow
   - اختيار الحزمة (1/2/3)
   - تحقق من الحقول عند الضغط
   - إرسال JSON إلى WEBHOOK_URL (Google Sheets)
   - تحويل إلى thank-you.html
   =================================================================== */
(function () {
  'use strict';

  var CFG = window.RAWASI_CONFIG;
  if (!CFG) return;

  var PRODUCT = CFG.products[CFG.featuredId];
  if (!PRODUCT) return;

  var bundles = (PRODUCT.bundles && PRODUCT.bundles.length)
    ? PRODUCT.bundles
    : [{ qty: 1, price: PRODUCT.price, label: 'علبة واحدة', badge: '' }];

  // الحزمة المختارة افتراضياً: الأكثر مبيعاً إن وُجد، وإلا الأولى
  var selectedIndex = 0;
  for (var i = 0; i < bundles.length; i++) {
    if (bundles[i].badge) { selectedIndex = i; break; }
  }

  var els = {
    bundles: document.getElementById('bundles'),
    form: document.getElementById('order-form'),
    summary: document.getElementById('order-summary'),
    submit: document.getElementById('order-submit'),
    toast: document.getElementById('toast'),
    heroPrice: document.getElementById('hero-price'),
    heroOld: document.getElementById('hero-old'),
    heroSave: document.getElementById('hero-save'),
    heroDiscount: document.getElementById('hero-discount'),
    barPrice: document.getElementById('bar-price'),
    barOld: document.getElementById('bar-old'),
    year: document.getElementById('year'),
    wa: document.getElementById('whatsapp-fab')
  };

  var FIELD_LABELS = {
    fullname: 'الاسم الكامل',
    phone: 'رقم الجوال',
    city: 'المدينة',
    district: 'الحي',
    address: 'العنوان التفصيلي'
  };

  /* ---------- helpers ---------- */
  function money(n) { return n + ' ر.س'; }

  function unitOld() { return PRODUCT.oldPrice || PRODUCT.price; }

  function normalizePhone(raw) {
    var d = String(raw).replace(/\D/g, '');
    if (d.indexOf('966') === 0 && d.length >= 11) return d.slice(0, 12);
    if (d.indexOf('05') === 0 && d.length === 10) return '966' + d.slice(1);
    if (d.indexOf('5') === 0 && d.length === 9) return '966' + d;
    if (d.length === 10 && d.charAt(0) === '0') return '966' + d.slice(1);
    return d;
  }

  function isSaudiPhone(raw) {
    var d = normalizePhone(raw);
    return d.length === 12 && d.indexOf('9665') === 0;
  }

  function formatDateSheet(d) {
    var day = String(d.getDate()).padStart(2, '0');
    var month = String(d.getMonth() + 1).padStart(2, '0');
    return day + '/' + month + '/' + d.getFullYear();
  }

  function generateOrderId() {
    var prefix = (CFG.orderIdPrefix || 'nama').toLowerCase();
    return prefix + Math.floor(10000 + Math.random() * 90000);
  }

  function generateRandomSku() {
    return 'NMA' + Math.floor(100000 + Math.random() * 900000);
  }

  function showToast(msg) {
    if (!els.toast) return;
    els.toast.textContent = msg;
    els.toast.hidden = false;
    /* reflow then animate */
    void els.toast.offsetWidth;
    els.toast.classList.add('toast--visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      els.toast.classList.remove('toast--visible');
      setTimeout(function () { els.toast.hidden = true; }, 350);
    }, 4000);
  }

  /* ---------- rendering ---------- */
  function currentBundle() { return bundles[selectedIndex]; }

  function renderBundles() {
    if (!els.bundles) return;
    els.bundles.innerHTML = bundles.map(function (b, idx) {
      var perUnit = Math.round(b.price / b.qty);
      var oldTotal = unitOld() * b.qty;
      return (
        '<button type="button" class="bundle' + (idx === selectedIndex ? ' is-active' : '') +
          '" role="radio" aria-checked="' + (idx === selectedIndex) + '" data-idx="' + idx + '">' +
          (b.badge ? '<span class="bundle__badge">' + b.badge + '</span>' : '') +
          '<span class="bundle__check" aria-hidden="true"></span>' +
          '<span class="bundle__main">' +
            '<span class="bundle__label">' + b.label + '</span>' +
            '<span class="bundle__per">' + money(perUnit) + ' للعلبة</span>' +
          '</span>' +
          '<span class="bundle__right">' +
            '<span class="bundle__price">' + money(b.price) + '</span>' +
            '<span class="bundle__old">' + money(oldTotal) + '</span>' +
          '</span>' +
        '</button>'
      );
    }).join('');
  }

  function renderSummary() {
    var b = currentBundle();
    if (els.summary) {
      els.summary.innerHTML =
        '<span>' + PRODUCT.shortAr + ' × ' + b.qty + '</span>' +
        '<strong>' + money(b.price) + '</strong>';
    }
  }

  function renderPrices() {
    var unit = PRODUCT.price;
    if (els.heroPrice) els.heroPrice.textContent = money(unit);
    if (els.heroOld) els.heroOld.textContent = money(unitOld());
    if (els.heroSave) els.heroSave.textContent = 'وفّري ' + (unitOld() - unit) + ' ر.س';
    if (els.heroDiscount) {
      var pct = Math.round((1 - unit / unitOld()) * 100);
      els.heroDiscount.textContent = '−' + pct + '%';
    }
    if (els.barPrice) els.barPrice.textContent = money(unit);
    if (els.barOld) els.barOld.textContent = money(unitOld());
  }

  function selectBundle(idx) {
    if (idx < 0 || idx >= bundles.length) return;
    selectedIndex = idx;
    renderBundles();
    renderSummary();
  }

  /* ---------- validation ---------- */
  function clearErrors() {
    if (!els.form) return;
    var nodes = els.form.querySelectorAll('.is-error');
    for (var i = 0; i < nodes.length; i++) nodes[i].classList.remove('is-error');
  }

  function validate() {
    clearErrors();
    var order = ['fullname', 'phone', 'city', 'district', 'address'];
    for (var i = 0; i < order.length; i++) {
      var name = order[i];
      var el = els.form.elements[name];
      if (!el || !String(el.value || '').trim()) {
        if (el) { el.classList.add('is-error'); el.focus(); }
        showToast('يرجى إدخال ' + FIELD_LABELS[name]);
        return null;
      }
    }
    var phoneEl = els.form.elements.phone;
    if (!isSaudiPhone(phoneEl.value)) {
      phoneEl.classList.add('is-error');
      phoneEl.focus();
      showToast('رقم الجوال يجب أن يكون سعودياً (05xxxxxxxx)');
      return null;
    }
    return {
      name: String(els.form.elements.fullname.value).trim(),
      phone: normalizePhone(phoneEl.value),
      city: String(els.form.elements.city.value).trim(),
      district: String(els.form.elements.district.value).trim(),
      address: String(els.form.elements.address.value).trim()
    };
  }

  /* ---------- webhook ---------- */
  function buildPayload(orderId, customer, bundle) {
    var total = Math.round(Number(bundle.price) || 0);
    var products = [], skus = [], qtys = [];
    products.push(PRODUCT.nameAr);
    skus.push(generateRandomSku());
    qtys.push(String(bundle.qty));
    var fullAddress = [customer.city, customer.district, customer.address]
      .filter(Boolean)
      .join('، ');
    return {
      date: formatDateSheet(new Date()),
      orderid: orderId,
      country: 'KSA',
      name: customer.name,
      phone: customer.phone,
      product: products.join('/'),
      sku: skus.join('/'),
      quantity: qtys.join('/'),
      'total price': total,
      totalPrice: total,
      currency: 'SAR',
      city: customer.city,
      district: customer.district,
      address: fullAddress
    };
  }

  function sendWebhook(payload) {
    if (!CFG.WEBHOOK_URL) {
      console.warn('WEBHOOK_URL غير مضبوط في js/config.js');
      return Promise.resolve();
    }
    return fetch(CFG.WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(payload)
    });
  }

  function submitOrder(e) {
    if (e) e.preventDefault();
    var customer = validate();
    if (!customer) return;

    var bundle = currentBundle();
    var orderId = generateOrderId();
    var payload = buildPayload(orderId, customer, bundle);

    els.submit.disabled = true;
    els.submit.textContent = 'جارٍ الإرسال...';

    sendWebhook(payload)
      .catch(function () { /* no-cors: نتجاهل ونكمل */ })
      .then(function () {
        window.location.href = 'thank-you.html?order=' +
          encodeURIComponent(orderId) + '&total=' + payload['total price'];
      });
  }

  /* ---------- events ---------- */
  if (els.bundles) {
    els.bundles.addEventListener('click', function (e) {
      var btn = e.target.closest('.bundle');
      if (!btn) return;
      selectBundle(parseInt(btn.getAttribute('data-idx'), 10) || 0);
    });
  }

  if (els.form) {
    els.form.addEventListener('submit', submitOrder);
    els.form.addEventListener('input', function (e) {
      if (e.target && e.target.classList) e.target.classList.remove('is-error');
    });
  }

  if (els.wa && CFG.whatsapp) {
    var site = CFG.siteUrl || 'https://rawasishop.com';
    els.wa.href = 'https://wa.me/' + CFG.whatsapp + '?text=' +
      encodeURIComponent('السلام عليكم، استفسار عن ' + PRODUCT.shortAr + ' من ' + site);
  }

  if (els.year) els.year.textContent = new Date().getFullYear();

  /* ---------- init ---------- */
  renderPrices();
  renderBundles();
  renderSummary();
})();

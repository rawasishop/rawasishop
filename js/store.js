(function () {
  var CFG = window.RAWASI_CONFIG;
  if (!CFG) return;

  var cart = [];
  var pendingOrder = null;

  var els = {
    cartDrawer: document.getElementById('cart-drawer'),
    cartOverlay: document.getElementById('cart-overlay'),
    cartItems: document.getElementById('cart-items'),
    cartEmpty: document.getElementById('cart-empty'),
    cartSubtotal: document.getElementById('cart-subtotal'),
    cartBadge: document.getElementById('cart-badge'),
    checkoutModal: document.getElementById('checkout-modal'),
    checkoutOverlay: document.getElementById('checkout-overlay'),
    checkoutForm: document.getElementById('checkout-form'),
    checkoutSummary: document.getElementById('checkout-summary'),
    upsellModal: document.getElementById('upsell-modal'),
    upsellOverlay: document.getElementById('upsell-overlay'),
    upsellTitle: document.getElementById('upsell-title'),
    upsellDesc: document.getElementById('upsell-desc'),
    upsellAccept: document.getElementById('upsell-accept'),
    upsellDecline: document.getElementById('upsell-decline'),
    toast: document.getElementById('toast')
  };

  function product(id) {
    return CFG.products[id];
  }

  function lineSubtotal(line) {
    if (line.linePrice != null) return line.linePrice;
    return product(line.id).price * line.qty;
  }

  function cartCount() {
    return cart.reduce(function (n, line) { return n + line.qty; }, 0);
  }

  function cartTotal() {
    return cart.reduce(function (sum, line) {
      return sum + lineSubtotal(line);
    }, 0);
  }

  function formatPrice(n) {
    return n + ' ر.س';
  }

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
    var year = d.getFullYear();
    return day + '/' + month + '/' + year;
  }

  function generateOrderId() {
    var prefix = (CFG.orderIdPrefix || 'nama').toLowerCase();
    var num = Math.floor(10000 + Math.random() * 90000);
    return prefix + num;
  }

  function generateRandomSku() {
    var num = Math.floor(100000 + Math.random() * 900000);
    return 'NMA' + num;
  }

  function showToast(msg) {
    if (!els.toast) return;
    els.toast.textContent = msg;
    els.toast.hidden = false;
    els.toast.classList.add('toast--visible');
    setTimeout(function () {
      els.toast.classList.remove('toast--visible');
      setTimeout(function () { els.toast.hidden = true; }, 400);
    }, 4500);
  }

  var CART_STORAGE_KEY = 'rawasi_cart';
  var FIELD_LABELS = {
    fullname: 'الاسم الكامل',
    phone: 'رقم الجوال',
    city: 'المدينة',
    address: 'العنوان'
  };

  function lockBody(lock) {
    document.body.classList.toggle('modal-open', lock);
  }

  /** طبقة واحدة ظاهرة: cart | checkout | upsell | null */
  function setFlowLayer(layer) {
    var isCart = layer === 'cart';
    var isCheckout = layer === 'checkout';
    var isUpsell = layer === 'upsell';

    els.cartDrawer.classList.toggle('is-open', isCart);
    els.cartDrawer.classList.toggle('is-layer-hidden', !isCart);
    els.cartDrawer.setAttribute('aria-hidden', isCart ? 'false' : 'true');

    els.checkoutModal.classList.toggle('is-open', isCheckout);
    els.checkoutModal.classList.toggle('is-layer-hidden', !isCheckout);
    els.checkoutModal.setAttribute('aria-hidden', isCheckout ? 'false' : 'true');

    els.upsellModal.classList.toggle('is-open', isUpsell);
    els.upsellModal.classList.toggle('is-layer-hidden', !isUpsell);
    els.upsellModal.setAttribute('aria-hidden', isUpsell ? 'false' : 'true');

    els.cartOverlay.classList.toggle('is-visible', isCart);
    els.cartOverlay.setAttribute('aria-hidden', isCart ? 'false' : 'true');

    if (els.checkoutOverlay) {
      els.checkoutOverlay.classList.toggle('is-visible', isCheckout);
      els.checkoutOverlay.setAttribute('aria-hidden', isCheckout ? 'false' : 'true');
    }
    if (els.upsellOverlay) {
      els.upsellOverlay.classList.toggle('is-visible', isUpsell);
      els.upsellOverlay.setAttribute('aria-hidden', isUpsell ? 'false' : 'true');
    }

    lockBody(!!layer);
  }

  function openCart() {
    renderCart();
    setFlowLayer('cart');
  }

  function closeCart() {
    setFlowLayer(null);
  }

  function openCheckout() {
    setFlowLayer('checkout');
    renderCheckoutSummary();
    var submitBtn = document.getElementById('checkout-submit');
    if (submitBtn) submitBtn.disabled = false;
  }

  function closeCheckout() {
    setFlowLayer(null);
  }

  function closeAllModals() {
    setFlowLayer(null);
  }

  function openUpsell(offer) {
    setFlowLayer('upsell');
    els.upsellTitle.textContent = offer.title;
    els.upsellDesc.textContent = offer.desc;
    els.upsellModal.dataset.upsellId = offer.productId;
  }

  function persistCart() {
    try {
      if (cart.length === 0) {
        sessionStorage.removeItem(CART_STORAGE_KEY);
      } else {
        sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      }
    } catch (e) { /* ignore */ }
  }

  function loadCartFromStorage() {
    try {
      var raw = sessionStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      cart = parsed.filter(function (line) {
        return line && line.id && product(line.id);
      });
    } catch (e) {
      cart = [];
    }
  }

  function clearCartStorage() {
    try {
      sessionStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) { /* ignore */ }
  }

  function clearFieldErrors(form) {
    if (!form) return;
    form.querySelectorAll('.form-input--error').forEach(function (el) {
      el.classList.remove('form-input--error');
    });
  }

  function validateCheckoutForm(form) {
    clearFieldErrors(form);
    var fields = ['fullname', 'phone', 'city', 'address'];
    for (var i = 0; i < fields.length; i++) {
      var name = fields[i];
      var el = form.elements[name] || form[name];
      if (!el) continue;
      var val = String(el.value || '').trim();
      if (!val) {
        el.classList.add('form-input--error');
        showToast('يرجى إدخال ' + (FIELD_LABELS[name] || name));
        el.focus();
        return false;
      }
    }
    if (!isSaudiPhone(form.phone.value)) {
      form.phone.classList.add('form-input--error');
      showToast('رقم الجوال يجب أن يكون سعودياً (05xxxxxxxx)');
      form.phone.focus();
      return false;
    }
    return true;
  }

  function updateBadge() {
    var n = cartCount();
    if (els.cartBadge) {
      els.cartBadge.textContent = n;
      els.cartBadge.hidden = n === 0;
    }
  }

  function addToCart(id, qty, linePrice) {
    qty = qty || 1;
    if (!product(id)) return;
    cart = cart.filter(function (l) { return l.id !== id; });
    cart.push({
      id: id,
      qty: qty,
      linePrice: linePrice != null ? linePrice : null
    });
    updateBadge();
    persistCart();
    showToast('تمت الإضافة إلى السلة');
    openCart();
  }

  function setQty(id, qty) {
    qty = Math.max(0, qty);
    var idx = cart.findIndex(function (l) { return l.id === id; });
    if (idx === -1) return;
    var line = cart[idx];
    if (qty === 0) {
      cart.splice(idx, 1);
    } else {
      line.qty = qty;
      if (line.linePrice != null) {
        var unit = line.linePrice / (line.qty || 1);
        line.linePrice = Math.round(unit * qty);
      }
    }
    updateBadge();
    persistCart();
    renderCart();
    if (cart.length === 0) closeCart();
  }

  function renderCart() {
    if (!els.cartItems) return;
    if (cart.length === 0) {
      els.cartItems.innerHTML = '';
      if (els.cartEmpty) els.cartEmpty.hidden = false;
      if (els.cartSubtotal) els.cartSubtotal.textContent = formatPrice(0);
      return;
    }
    if (els.cartEmpty) els.cartEmpty.hidden = true;
    els.cartItems.innerHTML = cart.map(function (line) {
      var p = product(line.id);
      return (
        '<div class="cart-line" data-id="' + line.id + '">' +
        '<img src="' + p.image + '" alt="" width="64" height="64">' +
        '<div class="cart-line__info">' +
        '<p class="cart-line__name">' + p.shortAr + ' × ' + line.qty + '</p>' +
        '<p class="cart-line__price">' + formatPrice(lineSubtotal(line)) + '</p>' +
        '<div class="cart-line__qty">' +
        '<button type="button" class="qty-btn" data-action="minus" data-id="' + line.id + '" aria-label="تقليل">−</button>' +
        '<span>' + line.qty + '</span>' +
        '<button type="button" class="qty-btn" data-action="plus" data-id="' + line.id + '" aria-label="زيادة">+</button>' +
        '</div></div></div>'
      );
    }).join('');
    if (els.cartSubtotal) els.cartSubtotal.textContent = formatPrice(cartTotal());
  }

  function renderCheckoutSummary() {
    if (!els.checkoutSummary) return;
    els.checkoutSummary.innerHTML = cart.map(function (line) {
      var p = product(line.id);
      return '<div class="checkout-line"><span>' + p.shortAr + ' × ' + line.qty + '</span><strong>' + formatPrice(lineSubtotal(line)) + '</strong></div>';
    }).join('') + '<div class="checkout-line checkout-line--total"><span>الإجمالي</span><strong>' + formatPrice(cartTotal()) + '</strong></div>';
  }

  /**
   * هيكل الطلب المرسل إلى WEBHOOK_URL (يطابق أعمدة Google Sheets):
   * date, orderid (nama#####), country (KSA), name, phone (9665…),
   * product (عربي /), sku (عشوائي /), quantity (1/2/1), total price, currency (SAR)
   */
  function buildSheetPayload(orderId, customer, lines, total) {
    var phone = normalizePhone(customer.phone);
    var totalVal = Math.round(Number(total) || 0);
    return {
      date: formatDateSheet(new Date()),
      orderid: orderId,
      country: 'KSA',
      name: String(customer.name || '').trim(),
      phone: phone,
      product: lines
        .map(function (l) {
          return product(l.id).nameAr;
        })
        .join('/'),
      sku: lines
        .map(function () {
          return generateRandomSku();
        })
        .join('/'),
      quantity: lines
        .map(function (l) {
          return String(l.qty);
        })
        .join('/'),
      'total price': totalVal,
      totalPrice: totalVal,
      currency: 'SAR'
    };
  }

  function sendWebhook(payload) {
    if (!CFG.WEBHOOK_URL) {
      console.warn('WEBHOOK_URL غير مضبوط في js/config.js');
      return Promise.resolve({ ok: false, skipped: true });
    }
    var json = JSON.stringify(payload);
    /* text/plain + no-cors: يصل JSON صالحاً إلى postData.contents في Apps Script */
    return fetch(CFG.WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: json
    })
      .then(function () {
        return { ok: true };
      })
      .catch(function (err) {
        console.error('Webhook error', err);
        return { ok: false, error: err };
      });
  }

  function finalizeOrder(lines, customer) {
    var orderId = generateOrderId();
    var total = lines.reduce(function (s, l) { return s + lineSubtotal(l); }, 0);
    var payload = buildSheetPayload(orderId, customer, lines, total);
    return sendWebhook(payload).then(function () {
      return { orderId: orderId, total: total };
    });
  }

  function goThankYou(orderId, total) {
    closeAllModals();
    cart = [];
    clearCartStorage();
    updateBadge();
    window.location.href = 'thank-you.html?order=' + encodeURIComponent(orderId) + '&total=' + total;
  }

  function handleCheckoutSubmit() {
    var form = els.checkoutForm;
    if (!form) return;
    if (!validateCheckoutForm(form)) return;
    var customer = {
      name: form.fullname.value.trim(),
      phone: normalizePhone(form.phone.value),
      city: form.city.value.trim(),
      address: form.address.value.trim()
    };
    pendingOrder = {
      customer: customer,
      lines: cart.map(function (l) {
        return { id: l.id, qty: l.qty, linePrice: l.linePrice };
      })
    };

    var lastLine = pendingOrder.lines[pendingOrder.lines.length - 1];
    var upId = product(lastLine.id).upsellId;
    if (upId && CFG.upsellOffers[upId]) {
      var offer = CFG.upsellOffers[upId];
      var upProd = product(upId);
      openUpsell({
        productId: upId,
        title: 'عرض حصري قبل إرسال الطلب',
        desc: offer.label + ' — ' + upProd.shortAr + ' (' + formatPrice(upProd.price - offer.discount) + ')',
        discount: offer.discount
      });
      return;
    }

    submitPendingOrder(false);
  }

  function submitPendingOrder(withUpsell) {
    if (!pendingOrder) return;
    var lines = pendingOrder.lines.slice();
    if (withUpsell && els.upsellModal.dataset.upsellId) {
      var upId = els.upsellModal.dataset.upsellId;
      var offer = CFG.upsellOffers[upId];
      var upProd = product(upId);
      var upPrice = upProd.price - (offer ? offer.discount : 0);
      var existing = lines.find(function (l) { return l.id === upId; });
      if (existing) {
        existing.qty += 1;
        existing.linePrice = (existing.linePrice || upProd.price * existing.qty) + upPrice;
      } else {
        lines.push({ id: upId, qty: 1, linePrice: upPrice });
      }
    }
    var btn = document.getElementById('checkout-submit');
    if (btn) btn.disabled = true;
    finalizeOrder(lines, pendingOrder.customer)
      .then(function (res) {
        pendingOrder = null;
        goThankYou(res.orderId, res.total);
      })
      .catch(function () {
        showToast('تعذر إرسال الطلب، حاولي مرة أخرى');
      })
      .finally(function () {
        if (btn) btn.disabled = false;
      });
  }

  document.addEventListener('click', function (e) {
    var bundleBtn = e.target.closest('[data-add-bundle]');
    if (bundleBtn) {
      var id = bundleBtn.getAttribute('data-add-bundle');
      var qty = parseInt(bundleBtn.getAttribute('data-qty'), 10) || 1;
      var price = parseInt(bundleBtn.getAttribute('data-price'), 10);
      addToCart(id, qty, price);
      return;
    }
    var cartBtn = e.target.closest('[data-add-cart]');
    if (cartBtn) {
      addToCart(cartBtn.getAttribute('data-add-cart'), 1);
    }
  });

  document.getElementById('open-cart')?.addEventListener('click', openCart);
  document.getElementById('cart-close')?.addEventListener('click', closeCart);
  document.getElementById('cart-overlay')?.addEventListener('click', closeCart);
  document.getElementById('cart-checkout-btn')?.addEventListener('click', function () {
    if (cart.length === 0) return;
    openCheckout();
  });
  document.getElementById('checkout-close')?.addEventListener('click', closeCheckout);
  document.getElementById('checkout-overlay')?.addEventListener('click', closeCheckout);
  els.upsellOverlay?.addEventListener('click', function () {
    /* لا إغلاق بالنقر خارج upsell — تجنب إلغاء الطلب بالخطأ */
  });

  els.cartItems?.addEventListener('click', function (e) {
    var btn = e.target.closest('.qty-btn');
    if (!btn) return;
    var id = btn.getAttribute('data-id');
    var line = cart.find(function (l) { return l.id === id; });
    if (!line) return;
    if (btn.getAttribute('data-action') === 'plus') setQty(id, line.qty + 1);
    else setQty(id, line.qty - 1);
  });

  var submitBtn = document.getElementById('checkout-submit');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.addEventListener('click', handleCheckoutSubmit);
  }

  if (els.checkoutForm) {
    els.checkoutForm.addEventListener('input', function (e) {
      if (e.target && e.target.classList) {
        e.target.classList.remove('form-input--error');
      }
    });
  }

  if (els.upsellAccept) {
    els.upsellAccept.addEventListener('click', function () {
      submitPendingOrder(true);
    });
  }
  if (els.upsellDecline) {
    els.upsellDecline.addEventListener('click', function () {
      submitPendingOrder(false);
    });
  }

  var params = new URLSearchParams(window.location.search);
  var buyId = params.get('buy');
  if (buyId && product(buyId)) {
    cart = [{ id: buyId, qty: 1, linePrice: null }];
    updateBadge();
    persistCart();
    if (params.get('checkout') === '1') openCheckout();
  }

  var wa = document.getElementById('whatsapp-fab');
  if (wa && CFG.whatsapp) {
    var site = CFG.siteUrl || 'https://rawasishop.com';
    wa.href = 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent('السلام عليكم، استفسار عن منتجات رواسي من ' + site);
  }

  document.getElementById('year').textContent = new Date().getFullYear();
  loadCartFromStorage();
  setFlowLayer(null);
  updateBadge();

  window.RawasiStore = { addToCart: addToCart, openCart: openCart, closeAllModals: closeAllModals };
})();

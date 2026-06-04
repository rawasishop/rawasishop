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
    var t = Date.now().toString(36).toUpperCase();
    var r = Math.floor(Math.random() * 9000 + 1000);
    return CFG.orderIdPrefix + '-' + t + '-' + r;
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

  function lockBody(lock) {
    document.body.classList.toggle('modal-open', lock);
  }

  function openCart() {
    renderCart();
    els.cartDrawer.classList.add('is-open');
    els.cartOverlay.classList.add('is-visible');
    lockBody(true);
  }

  function closeCart() {
    els.cartDrawer.classList.remove('is-open');
    if (!els.checkoutModal.classList.contains('is-open') && !els.upsellModal.classList.contains('is-open')) {
      els.cartOverlay.classList.remove('is-visible');
      lockBody(false);
    }
  }

  function openCheckout() {
    closeCart();
    els.cartOverlay.classList.add('is-visible');
    renderCheckoutSummary();
    els.checkoutModal.classList.add('is-open');
    lockBody(true);
  }

  function closeCheckout() {
    els.checkoutModal.classList.remove('is-open');
    if (!els.upsellModal.classList.contains('is-open')) {
      els.cartOverlay.classList.remove('is-visible');
      lockBody(false);
    }
  }

  function closeAllModals() {
    els.cartDrawer.classList.remove('is-open');
    els.checkoutModal.classList.remove('is-open');
    els.upsellModal.classList.remove('is-open');
    els.cartOverlay.classList.remove('is-visible');
    lockBody(false);
  }

  function openUpsell(offer) {
    closeCheckout();
    els.cartDrawer.classList.remove('is-open');
    els.upsellTitle.textContent = offer.title;
    els.upsellDesc.textContent = offer.desc;
    els.upsellModal.dataset.upsellId = offer.productId;
    els.upsellModal.classList.add('is-open');
    els.cartOverlay.classList.add('is-visible');
    lockBody(true);
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

  function buildSheetPayload(orderId, customer, lines, total) {
    return {
      date: formatDateSheet(new Date()),
      orderid: orderId,
      country: CFG.country,
      name: customer.name,
      phone: customer.phone,
      product: lines.map(function (l) { return product(l.id).nameAr; }).join('/'),
      sku: lines.map(function (l) { return product(l.id).sku; }).join('/'),
      quantity: lines.map(function (l) { return String(l.qty); }).join('/'),
      'total price': total,
      currency: CFG.currency,
      status: '',
      source: CFG.siteUrl || 'rawasishop.com'
    };
  }

  function sendWebhook(payload) {
    if (!CFG.WEBHOOK_URL) {
      console.warn('WEBHOOK_URL غير مضبوط في js/config.js');
      return Promise.resolve({ ok: false, skipped: true });
    }
    var body = 'payload=' + encodeURIComponent(JSON.stringify(payload));
    return fetch(CFG.WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: body
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
    updateBadge();
    window.location.href = 'thank-you.html?order=' + encodeURIComponent(orderId) + '&total=' + total;
  }

  function handleCheckoutSubmit() {
    var form = els.checkoutForm;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (!isSaudiPhone(form.phone.value)) {
      showToast('رقم الجوال يجب أن يكون سعودياً (05xxxxxxxx)');
      form.phone.focus();
      return;
    }
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
    finalizeOrder(lines, pendingOrder.customer).then(function (res) {
      pendingOrder = null;
      goThankYou(res.orderId, res.total);
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
  document.getElementById('cart-overlay')?.addEventListener('click', function () {
    if (els.upsellModal.classList.contains('is-open')) return;
    if (els.checkoutModal.classList.contains('is-open')) closeCheckout();
    else closeCart();
  });
  document.getElementById('cart-checkout-btn')?.addEventListener('click', function () {
    if (cart.length === 0) return;
    openCheckout();
  });
  document.getElementById('checkout-close')?.addEventListener('click', closeCheckout);
  document.getElementById('checkout-overlay')?.addEventListener('click', closeCheckout);

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
    submitBtn.addEventListener('click', handleCheckoutSubmit);
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
    if (params.get('checkout') === '1') openCheckout();
  }

  var wa = document.getElementById('whatsapp-fab');
  if (wa && CFG.whatsapp) {
    var site = CFG.siteUrl || 'https://rawasishop.com';
    wa.href = 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent('السلام عليكم، استفسار عن منتجات رواسي من ' + site);
  }

  document.getElementById('year').textContent = new Date().getFullYear();
  updateBadge();

  window.RawasiStore = { addToCart: addToCart, openCart: openCart };
})();

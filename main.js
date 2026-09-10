/* Not Luck — site behavior. Classic script, IIFE, no ES modules (file:// safe). */
(function () {
  "use strict";

  var DATA = window.__NTL__ || { products: [], packs: [] };
  var WALLET = window.__NTL_WALLET__;

  function safe(fn, name) {
    try { fn(); } catch (e) { if (window.console) console.warn("[" + name + "]", e); }
  }

  function fmt(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function euro(n) { return n.toFixed(2).replace(".", ",") + " €"; }

  /* ---------------- icons (no photography available — line-art per garment) ---------------- */
  var ICONS = {
    cap: '<path d="M18 56 Q18 24 50 24 Q82 24 82 56" /><path d="M82 56 L97 61 Q98 67 81 68 Z" /><path d="M18 56 L82 56" /><circle cx="50" cy="27" r="2.6" fill="currentColor" stroke="none"/>',
    tee: '<path d="M31 19 L15 32 L25 45 L31 39 L31 87 L69 87 L69 39 L75 45 L85 32 L69 19 Q64 28 50 28 Q36 28 31 19 Z" />',
    hoodie: '<path d="M31 23 Q31 12 50 12 Q69 12 69 23 L82 34 L73 47 L67 40 L67 88 L33 88 L33 40 L27 47 L18 34 Z" /><line x1="45" y1="29" x2="43" y2="42" /><line x1="55" y1="29" x2="57" y2="42" />',
    jacket: '<path d="M33 21 L22 30 L28 47 L35 40 L35 89 L65 89 L65 40 L72 47 L78 30 L67 21 L59 21 L50 30 L41 21 Z" /><line x1="50" y1="30" x2="50" y2="89" />',
    cargo: '<path d="M33 14 L67 14 L69 40 L78 88 L61 88 L53 47 L47 47 L39 88 L22 88 L31 40 Z" /><rect x="25" y="49" width="13" height="15" rx="2" /><rect x="62" y="49" width="13" height="15" rx="2" />',
  };
  function iconSvg(key) {
    var body = ICONS[key] || ICONS.tee;
    return '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">' + body + "</svg>";
  }

  /* ---------------- toast ---------------- */
  function toast(html) {
    var stack = document.querySelector("[data-toast-stack]");
    if (!stack) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = html;
    stack.appendChild(el);
    setTimeout(function () {
      el.classList.add("is-leaving");
      setTimeout(function () { el.remove(); }, 400);
    }, 4200);
  }

  /* ---------------- nav ---------------- */
  function initNav() {
    var header = document.querySelector("[data-site-header]");
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (header) {
      var onScroll = function () {
        header.classList.toggle("is-scrolled", window.scrollY > 12);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.classList.toggle("is-open", open);
      });
      nav.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("is-open");
          toggle.classList.remove("is-open");
        });
      });
    }
  }

  /* ---------------- reveal on scroll ---------------- */
  function initReveals() {
    var targets = document.querySelectorAll(".reveal");
    if (!targets.length) return;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: "0px 0px -2% 0px" }
    );
    targets.forEach(function (t) { io.observe(t); });
    setTimeout(function () {
      document.querySelectorAll(".reveal:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
      });
    }, 6000);
  }

  /* ---------------- card tilt (hover-capable devices only) ---------------- */
  function initTilt() {
    if (matchMedia("(hover: none)").matches) return;
    document.querySelectorAll(".product-card, .pack-card").forEach(function (card) {
      if (card.dataset.tiltBound) return;
      card.dataset.tiltBound = "1";
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "translateY(-6px) rotateX(" + (y * -6) + "deg) rotateY(" + (x * 6) + "deg)";
      });
      card.addEventListener("mouseout", function (e) {
        if (card.contains(e.relatedTarget)) return;
        card.style.transform = "";
      });
    });
  }

  /* ---------------- wallet chip everywhere ---------------- */
  function initWalletDisplays() {
    if (!WALLET) return;
    WALLET.onChange(function (balance) {
      document.querySelectorAll("[data-wallet-balance]").forEach(function (el) {
        el.textContent = fmt(balance);
      });
      document.dispatchEvent(new CustomEvent("ntl:wallet", { detail: { balance: balance } }));
    });
  }

  /* ---------------- product mounting (home teaser + shop) ---------------- */
  function productCardHtml(p) {
    var have = WALLET ? WALLET.balance() : 0;
    var short = Math.max(0, p.price - have);
    return (
      '<article class="product-card reveal" data-product="' + p.id + '">' +
        '<div class="product-figure">' + iconSvg(p.img) + "</div>" +
        '<span class="product-category">' + p.category + "</span>" +
        '<h3 class="product-name">' + p.name + "</h3>" +
        '<p class="product-blurb">' + p.blurb + "</p>" +
        '<div class="product-foot">' +
          '<span class="price-tag"><svg class="coin-ico" viewBox="0 0 200 200"><use href="#ntl-coin-simple"></use></svg>' + fmt(p.price) + "</span>" +
          '<button class="btn card-cta buy-btn" data-buy="' + p.id + '" data-state="' + (short > 0 ? "short" : "ok") + '">' +
            (short > 0 ? "Ver ficha" : "Comprar") +
          "</button>" +
        "</div>" +
      "</article>"
    );
  }

  function mountProducts(selector, list) {
    var target = document.querySelector(selector);
    if (!target || target.children.length > 0) return;
    target.innerHTML = list.map(productCardHtml).join("");
  }

  function refreshBuyButtons() {
    document.querySelectorAll(".buy-btn[data-buy]").forEach(function (btn) {
      var id = btn.getAttribute("data-buy");
      var p = DATA.products.filter(function (x) { return x.id === id; })[0];
      if (!p) return;
      var have = WALLET ? WALLET.balance() : 0;
      var ok = have >= p.price;
      btn.dataset.state = ok ? "ok" : "short";
      if (!btn.closest(".modal-card")) btn.textContent = ok ? "Comprar" : "Ver ficha";
    });
  }

  /* ---------------- quick view modal (shop + home) ---------------- */
  function buyProduct(p) {
    if (!WALLET) return;
    var ok = WALLET.debit(p.price, p.name);
    if (ok) {
      toast("<strong>" + p.name + "</strong> añadido a tu colección. Se descontaron " + fmt(p.price) + " NTL Coins.");
    } else {
      var short = p.price - WALLET.balance();
      toast("Te faltan <strong>" + fmt(short) + " NTL Coins</strong> para llevarte " + p.name + ".");
    }
    return ok;
  }

  function openQuickView(p) {
    var layer = document.querySelector("[data-quickview]");
    if (!layer) return;
    var have = WALLET ? WALLET.balance() : 0;
    var short = Math.max(0, p.price - have);
    layer.querySelector("[data-qv-figure]").innerHTML = iconSvg(p.img);
    layer.querySelector("[data-qv-category]").textContent = p.category;
    layer.querySelector("[data-qv-name]").textContent = p.name;
    layer.querySelector("[data-qv-desc]").textContent = p.desc;
    layer.querySelector("[data-qv-price]").textContent = fmt(p.price);
    var btn = layer.querySelector("[data-qv-buy]");
    var note = layer.querySelector("[data-qv-note]");
    btn.dataset.buy = p.id;
    if (short > 0) {
      btn.textContent = "Te faltan " + fmt(short) + " coins";
      btn.dataset.state = "short";
      note.innerHTML = 'Consigue más NTL Coins en <a href="monedas.html" style="color:var(--accent)">la tienda de monedas</a>.';
    } else {
      btn.textContent = "Comprar con NTL Coins";
      btn.dataset.state = "ok";
      note.innerHTML = "Se descontará de tu saldo NTL Coins al confirmar.";
    }
    layer.classList.add("is-open");
    layer.setAttribute("aria-hidden", "false");
  }

  function closeModal(layer) {
    layer.classList.remove("is-open");
    layer.setAttribute("aria-hidden", "true");
  }

  function initModals() {
    document.querySelectorAll(".modal-layer").forEach(function (layer) {
      layer.addEventListener("click", function (e) {
        if (e.target === layer) closeModal(layer);
      });
      var closeBtn = layer.querySelector(".modal-close");
      if (closeBtn) closeBtn.addEventListener("click", function () { closeModal(layer); });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeModal(layer);
      });
    });
  }

  function initProductInteractions() {
    document.addEventListener("click", function (e) {
      var openTrigger = e.target.closest("[data-product]");
      var qvBtn = e.target.closest("[data-qv-buy]");
      var buyBtn = e.target.closest(".buy-btn[data-buy]");

      if (qvBtn) {
        var id = qvBtn.getAttribute("data-buy");
        var p = DATA.products.filter(function (x) { return x.id === id; })[0];
        if (p && buyProduct(p)) {
          var layer = document.querySelector("[data-quickview]");
          if (layer) closeModal(layer);
        }
        refreshBuyButtons();
        return;
      }

      if (buyBtn && !buyBtn.closest("[data-quickview]")) {
        var pid = buyBtn.getAttribute("data-buy");
        var prod = DATA.products.filter(function (x) { return x.id === pid; })[0];
        if (!prod) return;
        if (buyBtn.dataset.state === "ok") {
          buyProduct(prod);
          refreshBuyButtons();
        } else {
          openQuickView(prod);
        }
        return;
      }

      if (openTrigger && !e.target.closest(".buy-btn")) {
        var opid = openTrigger.getAttribute("data-product");
        var oprod = DATA.products.filter(function (x) { return x.id === opid; })[0];
        if (oprod) openQuickView(oprod);
      }
    });
  }

  /* ---------------- shop filters ---------------- */
  function initFilters() {
    var row = document.querySelector("[data-filter-row]");
    if (!row) return;
    row.addEventListener("click", function (e) {
      var chip = e.target.closest(".filter-chip");
      if (!chip) return;
      row.querySelectorAll(".filter-chip").forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      var cat = chip.getAttribute("data-filter");
      document.querySelectorAll(".product-card").forEach(function (card) {
        var id = card.getAttribute("data-product");
        var p = DATA.products.filter(function (x) { return x.id === id; })[0];
        var show = cat === "all" || (p && p.category === cat);
        card.style.display = show ? "" : "none";
      });
    });
  }

  /* ---------------- coin packs ---------------- */
  function packCardHtml(pack) {
    return (
      '<article class="pack-card reveal">' +
        (pack.tag ? '<span class="pack-tag">' + pack.tag + "</span>" : "") +
        '<div class="pack-coin"><svg viewBox="0 0 200 200"><use href="#ntl-coin-simple"></use></svg></div>' +
        '<div><div class="pack-amount">' + fmt(pack.coins) + ' <small>coins</small></div>' +
          '<div class="pack-name">' + pack.name + "</div></div>" +
        '<div class="pack-price">' + euro(pack.price) + "</div>" +
        '<button class="btn btn-primary btn-block" data-open-pack="' + pack.id + '">Comprar lote</button>' +
        '<p class="pack-note">Calibrado para una pieza de la colección.</p>' +
      "</article>"
    );
  }

  function mountPacks() {
    var target = document.querySelector("[data-packs]");
    if (!target || target.children.length > 0) return;
    target.innerHTML = DATA.packs.map(packCardHtml).join("");
  }

  function openCheckout(pack) {
    var layer = document.querySelector("[data-checkout]");
    if (!layer) return;
    layer.querySelector("[data-co-coins]").textContent = fmt(pack.coins);
    layer.querySelector("[data-co-price]").textContent = euro(pack.price);
    layer.querySelector("[data-co-name]").textContent = pack.name;
    var form = layer.querySelector("[data-co-form]");
    var processing = layer.querySelector("[data-co-processing]");
    var success = layer.querySelector("[data-co-success]");
    form.classList.add("is-active");
    processing.classList.remove("is-active");
    success.classList.remove("is-active");
    form.style.display = "";
    form.dataset.pack = pack.id;
    layer.classList.add("is-open");
    layer.setAttribute("aria-hidden", "false");
  }

  function initCheckout() {
    var layer = document.querySelector("[data-checkout]");
    if (!layer) return;
    var form = layer.querySelector("[data-co-form]");
    var processing = layer.querySelector("[data-co-processing]");
    var success = layer.querySelector("[data-co-success]");

    document.addEventListener("click", function (e) {
      var openBtn = e.target.closest("[data-open-pack]");
      if (openBtn) {
        var id = openBtn.getAttribute("data-open-pack");
        var pack = DATA.packs.filter(function (x) { return x.id === id; })[0];
        if (pack) openCheckout(pack);
      }
      var doneBtn = e.target.closest("[data-co-done]");
      if (doneBtn) closeModal(layer);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var id = form.dataset.pack;
      var pack = DATA.packs.filter(function (x) { return x.id === id; })[0];
      if (!pack) return;
      form.style.display = "none";
      processing.classList.add("is-active");
      setTimeout(function () {
        processing.classList.remove("is-active");
        success.classList.add("is-active");
        success.querySelector("[data-co-success-coins]").textContent = fmt(pack.coins);
        if (WALLET) WALLET.credit(pack.coins, pack.name);
        renderLedger();
        refreshBuyButtons();
      }, 1400);
    });
  }

  /* ---------------- ledger ---------------- */
  function renderLedger() {
    var target = document.querySelector("[data-ledger]");
    if (!target || !WALLET) return;
    var entries = WALLET.ledger();
    if (!entries.length) {
      target.innerHTML = '<p class="ledger-empty">Todavía no hay movimientos. Compra tu primer lote para empezar.</p>';
      return;
    }
    target.innerHTML = entries
      .map(function (e) {
        var d = new Date(e.t);
        var when = d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }) + " · " + d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
        var isCredit = e.type === "credit";
        return (
          '<div class="ledger-row"><span>' + (isCredit ? "Recarga · " : "Compra · ") + (e.label || "") + '<br><small style="color:var(--ink-dim)">' + when + "</small></span>" +
          '<span class="amt ' + (isCredit ? "credit" : "debit") + '">' + (isCredit ? "+" : "−") + fmt(e.amount) + "</span></div>"
        );
      })
      .join("");
  }

  /* ---------------- boot ---------------- */
  function boot() {
    safe(initNav, "initNav");
    safe(initWalletDisplays, "initWalletDisplays");
    safe(function () { mountProducts("[data-home-products]", DATA.products.slice(0, 3)); }, "mountHomeProducts");
    safe(function () { mountProducts("[data-shop-products]", DATA.products); }, "mountShopProducts");
    safe(mountPacks, "mountPacks");
    safe(initModals, "initModals");
    safe(initProductInteractions, "initProductInteractions");
    safe(initFilters, "initFilters");
    safe(initCheckout, "initCheckout");
    safe(renderLedger, "renderLedger");
    safe(initReveals, "initReveals");
    safe(initTilt, "initTilt");
    safe(refreshBuyButtons, "refreshBuyButtons");
    document.addEventListener("ntl:wallet", function () { safe(refreshBuyButtons, "refreshBuyButtons"); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

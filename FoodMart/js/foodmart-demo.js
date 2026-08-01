(function () {
  var CART_KEY = "foodmartDemoCart";
  var ACCOUNT_KEY = "foodmartDemoAccount";

  function read(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function money(value) {
    return "$" + Number(value || 0).toFixed(2);
  }

  function cart() {
    return read(CART_KEY, []);
  }

  function saveCart(items) {
    write(CART_KEY, items);
    renderCart();
  }

  function account() {
    var saved = read(ACCOUNT_KEY, null);
    if (saved) return saved;
    saved = {
      name: "Demo Customer",
      email: "customer@foodmart.demo",
      phone: "+1 980 349 4089"
    };
    write(ACCOUNT_KEY, saved);
    return saved;
  }

  function ensureStyles() {
    if (document.getElementById("foodmart-demo-style")) return;
    var style = document.createElement("style");
    style.id = "foodmart-demo-style";
    style.textContent = [
      ".foodmart-cart-link{position:relative;}",
      ".foodmart-cart-count{position:absolute;right:-6px;top:-6px;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:#ffc43f;color:#222;font-size:11px;line-height:18px;text-align:center;font-weight:800;}",
      ".foodmart-cart-row{display:grid;grid-template-columns:58px 1fr auto;gap:12px;align-items:center;padding:14px 0;border-bottom:1px solid #eee;}",
      ".foodmart-cart-row img{width:58px;height:58px;object-fit:contain;border-radius:12px;background:#f8f8f8;}",
      ".foodmart-cart-row h6{margin:0 0 4px;font-size:15px;}",
      ".foodmart-cart-row small{color:#777;}",
      ".foodmart-cart-controls{grid-column:2/4;display:flex;align-items:center;gap:8px;}",
      ".foodmart-cart-controls button{border:0;border-radius:999px;background:#f1f1f1;color:#222;min-width:34px;height:34px;font-weight:800;}",
      ".foodmart-cart-controls button[data-foodmart-remove]{background:#222;color:#fff;padding:0 12px;}",
      ".foodmart-cart-total-row{display:flex;align-items:center;justify-content:space-between;font-size:20px;font-weight:800;margin:18px 0;}",
      ".foodmart-demo-modal{position:fixed;inset:0;z-index:2000;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.5);padding:20px;}",
      ".foodmart-demo-modal.show{display:flex;}",
      ".foodmart-demo-card{width:min(520px,100%);background:#fff;border-radius:20px;padding:26px;box-shadow:0 24px 70px rgba(0,0,0,.25);}",
      ".foodmart-demo-card.is-product{width:min(980px,calc(100vw - 40px));padding:0;overflow:hidden;}",
      ".foodmart-demo-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}",
      ".foodmart-demo-card.is-product .foodmart-demo-head{position:absolute;right:18px;top:18px;z-index:2;margin:0;}",
      ".foodmart-demo-card.is-product .foodmart-demo-head h3{display:none;}",
      ".foodmart-demo-head h3{margin:0;font-weight:800;}",
      ".foodmart-demo-close{border:0;background:#f1f1f1;border-radius:50%;width:36px;height:36px;font-size:20px;}",
      ".foodmart-account-grid{display:grid;gap:12px;}",
      ".foodmart-account-item{background:#f8f8f8;border-radius:14px;padding:14px;}",
      ".foodmart-product-modal{display:grid;grid-template-columns:.95fr 1.05fr;min-height:500px;}",
      ".foodmart-product-image{background:#f8f8f8;display:grid;place-items:center;padding:34px;}",
      ".foodmart-product-image img{width:100%;height:100%;max-height:430px;object-fit:contain;}",
      ".foodmart-product-detail{padding:42px 44px 36px;display:flex;flex-direction:column;justify-content:center;}",
      ".foodmart-product-kicker{color:#ffc43f;font-size:13px;font-weight:900;letter-spacing:2px;margin-bottom:10px;text-transform:uppercase;}",
      ".foodmart-product-detail h4{font-size:42px;font-weight:900;line-height:1.05;margin:0 0 12px;color:#222;}",
      ".foodmart-product-rating{color:#ffc43f;font-weight:800;margin-bottom:16px;}",
      ".foodmart-product-rating span{color:#9a9a9a;font-weight:600;margin-left:8px;}",
      ".foodmart-product-desc{color:#777;font-size:16px;line-height:1.6;margin:0 0 20px;}",
      ".foodmart-product-price{display:flex;align-items:flex-end;gap:12px;margin-bottom:20px;}",
      ".foodmart-product-price strong{color:#222;font-size:40px;font-weight:900;line-height:1;}",
      ".foodmart-product-price del{color:#aaa;font-size:20px;font-weight:800;}",
      ".foodmart-product-meta{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:22px;}",
      ".foodmart-product-meta span{background:#f8f8f8;border-radius:999px;color:#555;font-weight:800;padding:8px 14px;}",
      ".foodmart-product-qty{display:flex;align-items:center;gap:14px;margin-bottom:24px;}",
      ".foodmart-product-qty button{width:38px;height:38px;border:0;border-radius:50%;background:#f1f1f1;color:#222;font-size:22px;font-weight:900;}",
      ".foodmart-product-qty strong{min-width:28px;text-align:center;font-size:22px;}",
      ".foodmart-product-add{border:0;border-radius:999px;background:#ffc43f;color:#222;font-size:18px;font-weight:900;padding:15px 24px;width:100%;}",
      ".product-item{cursor:pointer;}",
      "@media (max-width: 767px){.foodmart-demo-card.is-product{width:100%;}.foodmart-product-modal{grid-template-columns:1fr;}.foodmart-product-image{min-height:240px;padding:24px;}.foodmart-product-detail{padding:28px 24px;}.foodmart-product-detail h4{font-size:32px;}.foodmart-product-price strong{font-size:34px;}}",
      ".foodmart-toast{position:fixed;left:50%;bottom:26px;z-index:2100;transform:translate(-50%,18px);opacity:0;background:#222;color:#fff;border-radius:999px;padding:12px 18px;box-shadow:0 14px 40px rgba(0,0,0,.25);transition:.2s ease;}",
      ".foodmart-toast.show{opacity:1;transform:translate(-50%,0);}"
    ].join("");
    document.head.appendChild(style);
  }

  function toast(message) {
    var el = document.querySelector(".foodmart-toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "foodmart-toast";
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(el._timer);
    el._timer = setTimeout(function () {
      el.classList.remove("show");
    }, 2200);
  }

  function ensureAccountModal() {
    var modal = document.querySelector(".foodmart-demo-modal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.className = "foodmart-demo-modal";
    modal.innerHTML = '<div class="foodmart-demo-card"><div class="foodmart-demo-head"><h3>Demo Account</h3><button class="foodmart-demo-close" type="button" aria-label="Close">&times;</button></div><div class="foodmart-demo-body"></div></div>';
    modal.addEventListener("click", function (event) {
      if (event.target === modal || event.target.closest(".foodmart-demo-close")) {
        modal.classList.remove("show");
      }
    });
    document.body.appendChild(modal);
    return modal;
  }

  function showAccount() {
    var data = account();
    var lastOrder = read("foodmartDemoLastOrder", null);
    var modal = ensureAccountModal();
    modal.querySelector(".foodmart-demo-card").classList.remove("is-product");
    modal.querySelector(".foodmart-demo-head h3").textContent = "Demo Account";
    modal.querySelector(".foodmart-demo-body").innerHTML = [
      '<div class="foodmart-account-grid">',
      '<div class="foodmart-account-item"><strong>Name</strong><br><span>' + data.name + '</span></div>',
      '<div class="foodmart-account-item"><strong>Email</strong><br><span>' + data.email + '</span></div>',
      '<div class="foodmart-account-item"><strong>Phone</strong><br><span>' + data.phone + '</span></div>',
      '<div class="foodmart-account-item"><strong>Last order</strong><br><span>' + (lastOrder ? lastOrder.id : "No demo order yet") + '</span></div>',
      '</div>'
    ].join("");
    modal.classList.add("show");
  }

  function productFromCard(card) {
    var title = card.querySelector("h3") ? card.querySelector("h3").textContent.trim() : "FoodMart Product";
    var priceText = card.querySelector(".price") ? card.querySelector(".price").textContent.trim() : "$0";
    var img = card.querySelector("img") ? card.querySelector("img").getAttribute("src") : "";
    var qtyInput = card.querySelector(".input-number");
    var qty = Math.max(1, Number(qtyInput ? qtyInput.value : 1) || 1);
    return {
      id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + priceText.replace(/[^0-9]/g, "") + "-" + img.split("/").pop(),
      title: title,
      price: Number(priceText.replace(/[^0-9.]/g, "")) || 0,
      img: img,
      unit: card.querySelector(".qty") ? card.querySelector(".qty").textContent.trim() : "1 Unit",
      rating: card.querySelector(".rating") ? card.querySelector(".rating").textContent.replace(/\s+/g, " ").trim() : "4.5",
      desc: "Fresh-picked grocery favourite with balanced flavour, everyday value, and quick demo checkout.",
      qty: qty
    };
  }

  function showProductDetail(product) {
    var modal = ensureAccountModal();
    var card = modal.querySelector(".foodmart-demo-card");
    card.classList.add("is-product");
    modal.querySelector(".foodmart-demo-head h3").textContent = product.title;
    modal.querySelector(".foodmart-demo-body").innerHTML = [
      '<div class="foodmart-product-modal">',
      '<div class="foodmart-product-image"><img src="' + product.img + '" alt="' + product.title + '"></div>',
      '<div class="foodmart-product-detail">',
      '<div class="foodmart-product-kicker">FoodMart Selection</div>',
      '<h4>' + product.title + '</h4>',
      '<div class="foodmart-product-rating">★★★★★ <span>' + product.rating + ' customer rating</span></div>',
      '<p class="foodmart-product-desc">' + product.desc + '</p>',
      '<div class="foodmart-product-price"><strong>' + money(product.price) + '</strong><del>' + money(product.price + 5) + '</del></div>',
      '<div class="foodmart-product-meta"><span>' + product.unit + '</span><span>Fresh Stock</span><span>Local Demo</span></div>',
      '<div class="foodmart-product-qty"><button type="button" data-foodmart-product-dec>-</button><strong data-foodmart-product-qty>' + product.qty + '</strong><button type="button" data-foodmart-product-inc>+</button><span>item(s)</span></div>',
      '<button class="foodmart-product-add" type="button" data-foodmart-product-add>Add to Cart</button>',
      '</div>',
      '</div>'
    ].join("");
    modal._activeProduct = product;
    modal.classList.add("show");
  }

  function addToCart(product) {
    var items = cart();
    var existing = items.find(function (item) {
      return item.id === product.id;
    });
    if (existing) existing.qty += product.qty;
    else items.push(product);
    saveCart(items);
    toast(product.title + " added to cart.");
  }

  function changeCart(index, mode) {
    var items = cart();
    if (!items[index]) return;
    if (mode === "inc") items[index].qty += 1;
    if (mode === "dec") items[index].qty = Math.max(1, items[index].qty - 1);
    if (mode === "remove") items.splice(index, 1);
    saveCart(items);
  }

  function checkout() {
    var items = cart();
    if (!items.length) return;
    var total = items.reduce(function (sum, item) {
      return sum + item.price * item.qty;
    }, 0);
    var order = {
      id: "FM-" + Date.now().toString().slice(-6),
      total: total,
      items: items,
      time: new Date().toISOString()
    };
    write("foodmartDemoLastOrder", order);
    saveCart([]);
    toast("Demo checkout complete: " + order.id);
  }

  function renderCart() {
    var items = cart();
    var count = items.reduce(function (sum, item) {
      return sum + item.qty;
    }, 0);
    var total = items.reduce(function (sum, item) {
      return sum + item.price * item.qty;
    }, 0);

    document.querySelectorAll(".foodmart-cart-link").forEach(function (link) {
      var badge = link.querySelector(".foodmart-cart-count");
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "foodmart-cart-count";
        link.appendChild(badge);
      }
      badge.textContent = count;
      badge.style.display = count ? "block" : "none";
    });

    document.querySelectorAll(".cart-total").forEach(function (el) {
      el.textContent = money(total);
    });

    var offcanvas = document.querySelector("#offcanvasCart .offcanvas-body");
    if (!offcanvas) return;
    var rows = items.map(function (item, index) {
      return [
        '<div class="foodmart-cart-row">',
        '<img src="' + item.img + '" alt="">',
        '<div><h6>' + item.title + '</h6><small>' + money(item.price) + " x " + item.qty + '</small></div>',
        '<strong>' + money(item.price * item.qty) + '</strong>',
        '<div class="foodmart-cart-controls">',
        '<button type="button" data-foodmart-dec="' + index + '">-</button>',
        '<span>' + item.qty + '</span>',
        '<button type="button" data-foodmart-inc="' + index + '">+</button>',
        '<button type="button" data-foodmart-remove="' + index + '">Remove</button>',
        '</div>',
        '</div>'
      ].join("");
    }).join("");

    offcanvas.innerHTML = [
      '<div class="order-md-last">',
      '<h4 class="d-flex justify-content-between align-items-center mb-3"><span class="text-primary">Your cart</span><span class="badge bg-primary rounded-pill">' + count + '</span></h4>',
      rows || '<p class="text-body-secondary">Your cart is empty.</p>',
      '<div class="foodmart-cart-total-row"><span>Total</span><strong>' + money(total) + '</strong></div>',
      '<button class="w-100 btn btn-primary btn-lg" type="button" data-foodmart-checkout ' + (items.length ? "" : "disabled") + '>Continue to checkout</button>',
      '</div>'
    ].join("");
  }

  function bindClicks() {
    document.addEventListener("click", function (event) {
      var categoryItem = event.target.closest(".category-item");
      if (categoryItem) {
        event.preventDefault();
        activateProductTab(categoryItem.textContent);
        scrollToTarget("#women");
        return;
      }

      var viewCategories = event.target.closest('a[href="#category"], .section-header a.btn-link');
      if (viewCategories && viewCategories.textContent.toLowerCase().indexOf("categories") !== -1) {
        event.preventDefault();
        scrollToTarget("#category");
        return;
      }

      var menuLink = event.target.closest('.main-menu a[href^="#"]');
      if (menuLink && menuLink.getAttribute("href")) {
        var href = menuLink.getAttribute("href");
        if (document.querySelector(href)) {
          event.preventDefault();
          scrollToTarget(href);
          closeMobileMenu();
          return;
        }
      }

      var accountLink = event.target.closest(".foodmart-account-link");
      if (accountLink) {
        event.preventDefault();
        showAccount();
        return;
      }

      var addLink = event.target.closest(".product-item .nav-link");
      if (addLink && addLink.textContent.toLowerCase().indexOf("add to cart") !== -1) {
        event.preventDefault();
        showProductDetail(productFromCard(addLink.closest(".product-item")));
        return;
      }

      var productLink = event.target.closest(".product-item figure a, .product-item h3");
      if (productLink) {
        event.preventDefault();
        showProductDetail(productFromCard(productLink.closest(".product-item")));
        return;
      }

      var productCard = event.target.closest(".product-item");
      if (productCard && !event.target.closest(".btn-wishlist, .product-qty, button, input")) {
        event.preventDefault();
        showProductDetail(productFromCard(productCard));
        return;
      }

      var inc = event.target.closest("[data-foodmart-inc]");
      if (inc) {
        event.preventDefault();
        changeCart(Number(inc.getAttribute("data-foodmart-inc")), "inc");
        return;
      }

      var dec = event.target.closest("[data-foodmart-dec]");
      if (dec) {
        event.preventDefault();
        changeCart(Number(dec.getAttribute("data-foodmart-dec")), "dec");
        return;
      }

      var remove = event.target.closest("[data-foodmart-remove]");
      if (remove) {
        event.preventDefault();
        changeCart(Number(remove.getAttribute("data-foodmart-remove")), "remove");
        return;
      }

      var checkoutButton = event.target.closest("[data-foodmart-checkout]");
      if (checkoutButton) {
        event.preventDefault();
        checkout();
        return;
      }

      var productInc = event.target.closest("[data-foodmart-product-inc]");
      if (productInc) {
        event.preventDefault();
        var qtyEl = ensureAccountModal().querySelector("[data-foodmart-product-qty]");
        if (qtyEl) qtyEl.textContent = Number(qtyEl.textContent || 1) + 1;
        return;
      }

      var productDec = event.target.closest("[data-foodmart-product-dec]");
      if (productDec) {
        event.preventDefault();
        var decQtyEl = ensureAccountModal().querySelector("[data-foodmart-product-qty]");
        if (decQtyEl) decQtyEl.textContent = Math.max(1, Number(decQtyEl.textContent || 1) - 1);
        return;
      }

      var productAdd = event.target.closest("[data-foodmart-product-add]");
      if (productAdd) {
        event.preventDefault();
        var modal = ensureAccountModal();
        var activeProduct = modal._activeProduct;
        var activeQty = modal.querySelector("[data-foodmart-product-qty]");
        if (activeProduct) {
          activeProduct.qty = Number(activeQty ? activeQty.textContent : 1) || 1;
          addToCart(activeProduct);
          modal.classList.remove("show");
        }
      }
    });

    document.querySelectorAll(".filter-categories, .search-bar select").forEach(function (select) {
      select.addEventListener("change", function () {
        var value = select.value.toLowerCase();
        if (value.indexOf("drinks") !== -1) {
          activateProductTab("Juices");
          scrollToTarget("#women");
          return;
        }
        if (value.indexOf("chocolates") !== -1) {
          scrollToTarget("#sale");
          return;
        }
        if (value.indexOf("groceries") !== -1) {
          activateProductTab("Fruits & Veges");
          scrollToTarget("#women");
        }
      });
    });
  }

  function scrollToTarget(selector) {
    var target = document.querySelector(selector);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function closeMobileMenu() {
    if (!window.bootstrap) return;
    var menu = document.getElementById("offcanvasNavbar");
    if (!menu) return;
    var instance = bootstrap.Offcanvas.getInstance(menu);
    if (instance) instance.hide();
  }

  function activateProductTab(label) {
    var text = String(label || "").toLowerCase();
    var target = "#nav-all";
    if (text.indexOf("fruit") !== -1 || text.indexOf("veges") !== -1) target = "#nav-fruits";
    if (text.indexOf("drink") !== -1 || text.indexOf("juice") !== -1) target = "#nav-juices";
    var tab = document.querySelector('[data-bs-target="' + target + '"]');
    if (tab && window.bootstrap) {
      bootstrap.Tab.getOrCreateInstance(tab).show();
    } else if (tab) {
      document.querySelectorAll("#nav-tab .nav-link").forEach(function (item) {
        item.classList.toggle("active", item === tab);
      });
      document.querySelectorAll("#nav-tabContent .tab-pane").forEach(function (pane) {
        pane.classList.toggle("show", "#" + pane.id === target);
        pane.classList.toggle("active", "#" + pane.id === target);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    ensureStyles();
    bindClicks();
    renderCart();
  });
})();

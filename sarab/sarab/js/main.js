AOS.init({
    duration: 680,
    once: true,
    offset: 55
});

/* NAVBAR SCROLL & ACTIVE LINK  */
window.addEventListener('scroll', function() {
    document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 60);
    document.getElementById('btt').classList.toggle('show', window.scrollY > 300);
    document.querySelectorAll('section[id]').forEach(function(sec) {
        var top = sec.offsetTop - 110,
            bot = top + sec.offsetHeight;
        if (window.scrollY >= top && window.scrollY < bot) {
            document.querySelectorAll('.nav-link').forEach(function(l) {
                l.classList.remove('active');
            });
            var lnk = document.querySelector('.nav-link[href="#' + sec.id + '"]');
            if (lnk) lnk.classList.add('active');
        }
    });
});

/*  SMOOTH SCROLL + MOBILE NAV CLOSE  */
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
        var href = this.getAttribute('href');
        if (href === '#') return;
        var t = document.querySelector(href);
        if (t) {
            e.preventDefault();
            // Close Bootstrap mobile navbar if open
            var navCollapse = document.getElementById('navmenu');
            if (navCollapse && navCollapse.classList.contains('show')) {
                var bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
                if (bsCollapse) {
                    bsCollapse.hide();
                } else {
                    navCollapse.classList.remove('show');
                }
            }
            // Scroll after slight delay to let navbar close
            setTimeout(function() {
                window.scrollTo({
                    top: t.offsetTop - 78,
                    behavior: 'smooth'
                });
            }, 50);
        }
    });
});


var adminOpen = document.getElementById("adminOpen");
if (adminOpen) {
    adminOpen.addEventListener("click", function(e) {
        e.preventDefault();
        var target = adminOpen.getAttribute("data-admin-url") || adminOpen.getAttribute("href");
        if (target) window.location.href = target;
    });
}

var searchOv = document.getElementById('searchOv');

document.getElementById('navSearchBtn').addEventListener('click', function() {
    searchOv.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function() {
        document.getElementById('searchInput').focus();
    }, 220);
});

document.getElementById('searchClose').addEventListener('click', closeSearch);

// Close when clicking backdrop
searchOv.addEventListener('click', function(e) {
    if (e.target === searchOv) closeSearch();
});

function closeSearch() {
    searchOv.classList.remove('open');
    document.body.style.overflow = '';
}

var authToken = localStorage.getItem("patriaAuthToken") || "";
var guestId = localStorage.getItem("patriaGuestId") || (Date.now().toString(36) + Math.random().toString(36).slice(2));
localStorage.setItem("patriaGuestId", guestId);
var currentUser = null;
var isLoggedIn = Boolean(authToken);
var pendingCheckout = false;

function productSlug(text) {
    return String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

var PATRIA_API_BASE = window.PATRIA_API_BASE || "";

function apiUrl(path) {
    if (String(path).indexOf("http://") === 0 || String(path).indexOf("https://") === 0) return path;
    if (PATRIA_API_BASE) return PATRIA_API_BASE.replace(/\/$/, "") + path;
    if (window.location.protocol === "file:") return "http://127.0.0.1:8080" + path;
    return path;
}

function apiRequest(path, options) {
    options = options || {};
    options.headers = options.headers || {};
    options.headers["Content-Type"] = "application/json";
    options.headers["X-Guest-Id"] = guestId;
    if (authToken) options.headers.Authorization = "Bearer " + authToken;
    if (options.body && typeof options.body !== "string") options.body = JSON.stringify(options.body);

    return Promise.resolve().then(function() {
        return fetch(apiUrl(path), options);
    }).then(function(res) {
        return res.text().then(function(text) {
            var data = {};
            if (text) {
                try {
                    data = JSON.parse(text);
                } catch (err) {
                    throw new Error("Backend API is not available. Please deploy sarab/sarab/server.js and connect /api routes.");
                }
            }
            if (!res.ok) throw new Error(data.error || "Request failed.");
            return data;
        });
    });
}

function setAuth(data) {
    if (data.token) {
        authToken = data.token;
        localStorage.setItem("patriaAuthToken", authToken);
    }
    if (data.user) currentUser = data.user;
    isLoggedIn = Boolean(authToken);
    if (data.cart) cartItems = data.cart.items || [];
    updateAccountDashboard();
}

function updateAccountDashboard() {
    var name = currentUser && currentUser.name ? currentUser.name : "jinfeng8605";
    accountOv && accountOv.querySelectorAll(".account-main h2").forEach(function(h2) {
        if (h2.textContent.indexOf("Welcome back") >= 0) h2.innerHTML = "Welcome back,<br/>" + name;
    });
    accountOv && accountOv.querySelectorAll(".account-stat span").forEach(function(span) {
        if (span.textContent === "jinfeng8605") span.textContent = name;
    });
}

function setAccountError(form, message) {
    var error = form && form.querySelector(".account-error");
    if (error) error.textContent = message || "";
}

function validateAccountForm(form) {
    var fields = form.querySelectorAll("input[type=\"text\"], input[type=\"email\"], input[type=\"password\"]");
    var valid = true;
    fields.forEach(function(field) {
        var empty = !field.value.trim();
        field.classList.toggle("field-error", empty);
        if (empty) valid = false;
    });
    if (!valid) setAccountError(form, "Please fill in all required fields.");
    else setAccountError(form, "");
    return valid;
}


var accountOv = document.getElementById("accountOv");
var accountOpen = document.getElementById("accountOpen");
var accountClose = document.getElementById("accountClose");
var accountDashboard = document.getElementById("accountDashboard");

if (accountOv && accountOpen && accountClose) {
    accountOpen.addEventListener("click", function(e) {
        e.preventDefault();
        if (isLoggedIn) {
            showAccountDashboard();
        } else {
            showAccountForm();
        }
        accountOv.classList.add("open");
        document.body.style.overflow = "hidden";
    });

    accountClose.addEventListener("click", closeAccount);

    accountOv.addEventListener("click", function(e) {
        if (e.target === accountOv) closeAccount();
    });

    accountOv.querySelectorAll(".account-password button").forEach(function(btn) {
        btn.addEventListener("click", function() {
            var input = btn.parentElement.querySelector("input");
            input.type = input.type === "password" ? "text" : "password";
        });
    });
}

function showAccountForm() {
    var hero = accountOv.querySelector(".account-hero");
    var panel = accountOv.querySelector(".account-panel");
    if (hero) hero.style.display = "block";
    if (panel) panel.style.display = "block";
    if (accountDashboard) accountDashboard.classList.remove("open");
}

function setAccountPage(page) {
    accountOv.querySelectorAll("[data-account-page]").forEach(function(btn) {
        btn.classList.toggle("active", btn.getAttribute("data-account-page") === page);
    });
    accountOv.querySelectorAll("[data-account-page-panel]").forEach(function(panel) {
        panel.classList.toggle("active", panel.getAttribute("data-account-page-panel") === page);
    });
}

function showAccountDashboard(page) {
    isLoggedIn = true;
    var hero = accountOv.querySelector(".account-hero");
    var panel = accountOv.querySelector(".account-panel");
    if (hero) hero.style.display = "block";
    if (panel) panel.style.display = "none";
    if (accountDashboard) accountDashboard.classList.add("open");
    setAccountPage(page || "dashboard");
}

function closeAccount() {
    accountOv.classList.remove("open");
    document.body.style.overflow = "";
}

if (accountOv) {
    accountOv.querySelectorAll(".account-card").forEach(function(form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();
        });
    });

    accountOv.querySelectorAll(".account-btn").forEach(function(btn) {
        btn.addEventListener("click", function(e) {
            e.preventDefault();
            var form = btn.closest(".account-card");
            if (!validateAccountForm(form)) return;

            var action = btn.getAttribute("data-account-action");
            var fields = form.querySelectorAll("input[type=\"text\"], input[type=\"email\"], input[type=\"password\"]");
            var body;

            if (action === "register") {
                body = {
                    name: fields[0].value.trim(),
                    email: fields[1].value.trim(),
                    phone: fields[2].value.trim(),
                    password: fields[3].value,
                    guestId: guestId
                };
                apiRequest("/api/register", { method: "POST", body: body }).then(function(data) {
                    setAuth(data);
                    showAccountDashboard();
                    renderOrder();
                    if (pendingCheckout) checkoutOrder();
                }).catch(function(err) {
                    setAccountError(form, err.message);
                });
                return;
            }

            body = { login: fields[0].value.trim(), password: fields[1].value, guestId: guestId };
            apiRequest("/api/login", { method: "POST", body: body }).then(function(data) {
                setAuth(data);
                showAccountDashboard();
                renderOrder();
                if (pendingCheckout) checkoutOrder();
            }).catch(function(err) {
                setAccountError(form, err.message);
            });
        });
    });

    accountOv.querySelectorAll("[data-account-page]").forEach(function(btn) {
        btn.addEventListener("click", function() {
            showAccountDashboard(btn.getAttribute("data-account-page"));
        });
    });

    accountOv.querySelectorAll(".account-start-order").forEach(function(btn) {
        btn.addEventListener("click", function() {
            closeAccount();
            document.getElementById("category").scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    accountOv.querySelectorAll(".account-save-btn").forEach(function(btn) {
        btn.addEventListener("click", function() {
            var panel = btn.closest("[data-account-page-panel]");
            var inputs = panel.querySelectorAll("input");
            if (panel.getAttribute("data-account-page-panel") === "addresses") {
                apiRequest("/api/address", {
                    method: "PUT",
                    body: { fullName: inputs[0].value, phone: inputs[1].value, address: inputs[2].value, city: inputs[3].value, zip: inputs[4].value }
                }).then(function(data) {
                    currentUser = data.user;
                    alert("Address saved.");
                }).catch(function(err) { alert(err.message); });
                return;
            }
            apiRequest("/api/me", {
                method: "PUT",
                body: { name: inputs[0].value, email: inputs[1].value, phone: inputs[2].value, password: inputs[3].value }
            }).then(function(data) {
                currentUser = data.user;
                updateAccountDashboard();
                alert("Account details saved.");
            }).catch(function(err) { alert(err.message); });
        });
    });

    var accountLogout = document.getElementById("accountLogout");
    if (accountLogout) {
        accountLogout.addEventListener("click", function() {
            apiRequest("/api/logout", { method: "POST" }).finally(function() {
                authToken = "";
                currentUser = null;
                isLoggedIn = false;
                localStorage.removeItem("patriaAuthToken");
                showAccountForm();
                renderOrder();
            });
        });
    }
}

var orderOv = document.getElementById("orderOv");
var orderOpen = document.getElementById("orderOpen");
var orderClose = document.getElementById("orderClose");

if (orderOv && orderOpen && orderClose) {
    orderOpen.addEventListener("click", function(e) {
        e.preventDefault();
        renderOrder();
        orderOv.classList.add("open");
        document.body.style.overflow = "hidden";
    });

    orderClose.addEventListener("click", closeOrder);

    orderOv.addEventListener("click", function(e) {
        if (e.target === orderOv) closeOrder();
    });
}

function closeOrder() {
    orderOv.classList.remove("open");
    document.body.style.overflow = "";
}

function renderOrder() {
    var orderBody = document.getElementById("orderBody");
    if (!orderBody) return;

    if (!cartItems.length) {
        orderBody.classList.add("is-empty");
        orderBody.innerHTML = "<p class=\"order-empty\">No products in the cart.</p>";
        return;
    }

    orderBody.classList.remove("is-empty");
    var total = cartItems.reduce(function(sum, item) {
        return sum + item.priceValue * item.qty;
    }, 0);

    orderBody.innerHTML = "<div class=\"order-list\">" + cartItems.map(function(item, index) {
        var itemTotal = item.priceValue * item.qty;
        return "<div class=\"order-item\">" +
            "<img src=\"" + item.img + "\" alt=\"" + item.title + "\"/>" +
            "<div class=\"order-item-info\"><div class=\"order-item-title\">" + item.title + "</div>" +
            "<div class=\"order-item-meta\">" + item.cat + " · " + item.price + "</div>" +
            "<div class=\"order-controls\">" +
            "<button type=\"button\" class=\"order-qty-btn\" data-cart-action=\"dec\" data-cart-index=\"" + index + "\">-</button>" +
            "<span class=\"order-qty\">" + item.qty + "</span>" +
            "<button type=\"button\" class=\"order-qty-btn\" data-cart-action=\"inc\" data-cart-index=\"" + index + "\">+</button>" +
            "<button type=\"button\" class=\"order-remove\" data-cart-action=\"remove\" data-cart-index=\"" + index + "\">Remove</button>" +
            "</div>" +
            "<div class=\"order-item-total\">$" + itemTotal.toFixed(2) + "</div></div>" +
            "</div>";
    }).join("") + "<div class=\"order-summary\"><span>Total</span><span>$" + total.toFixed(2) + "</span></div>" +
        "<button type=\"button\" class=\"order-checkout\" data-cart-action=\"checkout\">Checkout</button>" +
        "<p class=\"order-login-note\">" + (isLoggedIn ? "You are logged in and ready to checkout." : "Please log in before checkout.") + "</p></div>";
}

function syncCart(data) {
    cartItems = data.items || [];
    renderOrder();
}

function updateCartItem(index, action) {
    if (action === "checkout") {
        checkoutOrder();
        return;
    }

    var item = cartItems[index];
    if (!item) return;

    if (action === "remove") {
        apiRequest("/api/cart/item", { method: "DELETE", body: { productId: item.id, guestId: guestId } }).then(syncCart).catch(function(err) {
            alert(err.message);
        });
        return;
    }

    var qty = item.qty + (action === "inc" ? 1 : -1);
    apiRequest("/api/cart/item", { method: "PATCH", body: { productId: item.id, qty: qty, guestId: guestId } }).then(syncCart).catch(function(err) {
        alert(err.message);
    });
}

function checkoutOrder() {
    if (!cartItems.length) return;

    if (!isLoggedIn) {
        pendingCheckout = true;
        closeOrder();
        showAccountForm();
        accountOv.classList.add("open");
        document.body.style.overflow = "hidden";
        return;
    }

    apiRequest("/api/checkout", { method: "POST" }).then(function(data) {
        pendingCheckout = false;
        syncCart(data.cart || { items: [] });
        alert("Order created: " + data.order.id);
    }).catch(function(err) {
        alert(err.message);
    });
}

function addCartItem(item, qty) {
    return apiRequest("/api/cart/add", {
        method: "POST",
        body: { productId: item.productId, title: item.title, qty: qty, guestId: guestId }
    }).then(function(data) {
        syncCart(data);
    });
}

document.addEventListener("click", function(e) {
    var btn = e.target.closest("[data-cart-action]");
    if (!btn) return;

    var index = parseInt(btn.getAttribute("data-cart-index"), 10);
    var action = btn.getAttribute("data-cart-action");
    updateCartItem(index, action);
});

// Category buttons inside search box
document.querySelectorAll('.sovcat').forEach(function(btn) {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.sovcat').forEach(function(b) {
            b.classList.remove('active');
        });
        this.classList.add('active');
        var f = this.getAttribute('data-cat');
        closeSearch();
        setTimeout(function() {
            filterMenu(f);
            document.getElementById('menu').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 300);
    });
});

// Trending tags fill the search input
document.querySelectorAll('.sovtrend .ttag').forEach(function(t) {
    t.addEventListener('click', function() {
        document.getElementById('searchInput').value = this.textContent.trim();
        document.getElementById('searchInput').focus();
    });
});


$(document).ready(function() {
	$('.magnific_popup').magnificPopup({
	  disableOn: 700,
	  type: 'iframe',
	  mainClass: 'mfp-fade',
	  removalDelay: 160,
	  preloader: false,
	  fixedContentPos: false,
	  disableOn: 300
	});	
});


function filterMenu(cat) {
    // sync filter buttons
    document.querySelectorAll('.filtbtn').forEach(function(b) {
        b.classList.toggle('active', b.getAttribute('data-f') === cat);
    });
    // sync category cards
    document.querySelectorAll('.catcard').forEach(function(c) {
        c.classList.toggle('active', c.getAttribute('data-filter') === cat);
    });
    // show/hide menu cards
    document.querySelectorAll('.mwrap').forEach(function(w) {
        var c = w.getAttribute('data-c');
        if (cat === 'all' || c === cat) {
            w.classList.remove('gone');
            w.style.opacity = '0';
            w.style.transform = 'translateY(16px)';
            setTimeout(function() {
                w.style.transition = 'opacity .38s,transform .38s';
                w.style.opacity = '1';
                w.style.transform = 'translateY(0)';
            }, 60);
        } else {
            w.classList.add('gone');
        }
    });
}

// Filter buttons
document.querySelectorAll('.filtbtn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        filterMenu(this.getAttribute('data-f'));
    });
});

// Category section cards â†’ scroll + filter
document.querySelectorAll('.catcard').forEach(function(card) {
    card.addEventListener('click', function() {
        var f = this.getAttribute('data-filter');
        window.scrollTo({
            top: document.getElementById('menu').offsetTop - 80,
            behavior: 'smooth'
        });
        setTimeout(function() {
            filterMenu(f);
        }, 480);
    });
});


var menuPop = document.getElementById('menuPop');
var mpQty = 1;
var currentMenuItem = null;
var cartItems = [];

function openMenuPop(card) {
    var img = card.getAttribute('data-img');
    var title = card.getAttribute('data-title');
    var cat = card.getAttribute('data-cat');
    var price = card.getAttribute('data-price');
    var old = card.getAttribute('data-old');
    var rating = parseFloat(card.getAttribute('data-rating'));
    var reviews = card.getAttribute('data-reviews');
    var cal = card.getAttribute('data-cal');
    var time = card.getAttribute('data-time');
    var desc = card.getAttribute('data-desc');
    var tags = card.getAttribute('data-tags') || '';
    currentMenuItem = {
        img: img,
        title: title,
        cat: cat,
        price: price,
        priceValue: parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0,
        productId: productSlug(title)
    };

    document.getElementById('mpImg').setAttribute('src', img);
    document.getElementById('mpCat').textContent = cat;
    document.getElementById('mpTitle').textContent = title;

    var full = Math.round(rating),
        empty = 5 - full;
    document.getElementById('mpStars').innerHTML =
        '<i class="fas fa-star"></i>'.repeat(full) + 'â˜†'.repeat(empty) +
        ' <span style="color:#bbb;font-size:.78rem;">' + rating + ' (' + reviews + ' reviews)</span>';

    document.getElementById('mpDesc').textContent = desc;

    document.getElementById('mpPrice').innerHTML =
        price + (old ? '<small style="color:#ccc;text-decoration:line-through;margin-left:8px;font-size:1rem;">' + old + '</small>' : '');

    document.getElementById('mpMeta').innerHTML =
        '<div class="mpm"><div class="mpmv">' + cal + ' kcal</div><div class="mpml">Calories</div></div>' +
        '<div class="mpm"><div class="mpmv">' + time + ' min</div><div class="mpml">Prep Time</div></div>' +
        '<div class="mpm"><div class="mpmv">' + rating + '/5</div><div class="mpml">Rating</div></div>';

    document.getElementById('mpTags').innerHTML =
        tags.split(',').filter(Boolean).map(function(t) {
            return '<span class="mptag">' + t.trim() + '</span>';
        }).join('');

    mpQty = 1;
    document.getElementById('mpQnum').textContent = 1;
    document.getElementById('mpAddCart').innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
    document.getElementById('mpAddCart').style.background = '';

    menuPop.classList.add('open');
    document.body.style.overflow = 'hidden';
}

// Card click open popup
document.querySelectorAll('.mcard').forEach(function(card) {
    card.addEventListener('click', function() {
        openMenuPop(this);
    });
});

// + button  open popup (stop propagation to avoid double firing)
document.querySelectorAll('.madd').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        openMenuPop(this.closest('.mcard'));
    });
});

// Heart toggle (no popup)
document.querySelectorAll('.mhrt').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var ico = this.querySelector('i');
        ico.classList.toggle('far');
        ico.classList.toggle('fas');
        this.style.color = ico.classList.contains('fas') ? 'var(--primary)' : '#ccc';
    });
});

// Close popup
document.getElementById('mpClose').addEventListener('click', closeMenuPop);
menuPop.addEventListener('click', function(e) {
    if (e.target === this) closeMenuPop();
});

function closeMenuPop() {
    menuPop.classList.remove('open');
    document.body.style.overflow = '';
}

// Qty +/-
document.getElementById('mpPlus').addEventListener('click', function() {
    document.getElementById('mpQnum').textContent = ++mpQty;
});
document.getElementById('mpMinus').addEventListener('click', function() {
    if (mpQty > 1) document.getElementById('mpQnum').textContent = --mpQty;
});

// Add to cart button
document.getElementById('mpAddCart').addEventListener('click', function() {
    if (!currentMenuItem) return;

    var self = this;
    addCartItem(currentMenuItem, mpQty).then(function() {
        self.innerHTML = '<i class="fas fa-check"></i> Added to Cart!';
        self.style.background = 'linear-gradient(135deg,var(--green),#1a4a35)';
        setTimeout(function() {
            closeMenuPop();
            self.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
            self.style.background = '';
            orderOv.classList.add('open');
            document.body.style.overflow = 'hidden';
        }, 650);
    }).catch(function(err) {
        alert(err.message);
    });
});


document.getElementById('resBtn').addEventListener('click', function() {
    var btn = this;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
    btn.disabled = true;
    setTimeout(function() {
        btn.innerHTML = '<i class="fas fa-calendar-check"></i> Confirm Reservation';
        btn.disabled = false;
        var ok = document.getElementById('resOk');
        ok.style.display = 'block';
        ok.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }, 1500);
});


document.getElementById('ctcBtn').addEventListener('click', function() {
    var btn = this;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;
    setTimeout(function() {
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        btn.disabled = false;
        var ok = document.getElementById('ctcOk');
        ok.style.display = 'block';
        ok.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }, 1500);
});


var galPop = document.getElementById('galPop');
var galData = [];
var galIdx = 0;

document.querySelectorAll('.gitem').forEach(function(item) {
    galData.push({
        img: item.getAttribute('data-gimg'),
        title: item.getAttribute('data-gtitle'),
        desc: item.getAttribute('data-gdesc')
    });
    item.addEventListener('click', function() {
        openGal(parseInt(this.getAttribute('data-gi')));
    });
});

function openGal(i) {
    galIdx = i;
    var g = galData[i];
    document.getElementById('gpImg').setAttribute('src', g.img);
    document.getElementById('gpTitle').textContent = g.title;
    document.getElementById('gpDesc').innerHTML = g.desc;
    galPop.classList.add('open');
    document.body.style.overflow = 'hidden';
}

document.getElementById('gpClose').addEventListener('click', closeGal);
galPop.addEventListener('click', function(e) {
    if (e.target === this) closeGal();
});

function closeGal() {
    galPop.classList.remove('open');
    document.body.style.overflow = '';
}

document.getElementById('gpPrev').addEventListener('click', function() {
    openGal((galIdx - 1 + galData.length) % galData.length);
});
document.getElementById('gpNext').addEventListener('click', function() {
    openGal((galIdx + 1) % galData.length);
});

/*  ESC key closes everything */
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeSearch();
        closeMenuPop();
        closeGal();
        if (typeof $.magnificPopup !== 'undefined') $.magnificPopup.close();
    }
});


new Swiper('.tesSwiper', {
    slidesPerView: 1,
    spaceBetween: 22,
    loop: true,
    autoplay: {
        delay: 4000,
        disableOnInteraction: false
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true
    },
    breakpoints: {
        640: {
            slidesPerView: 2
        },
        1024: {
            slidesPerView: 3
        }
    }
});


var cH = 8,
    cM = 45,
    cS = 30;
setInterval(function() {
    cS--;
    if (cS < 0) {
        cS = 59;
        cM--;
    }
    if (cM < 0) {
        cM = 59;
        cH--;
    }
    if (cH < 0) {
        cH = 8;
        cM = 45;
        cS = 30;
    }
    document.getElementById('cdH').textContent = String(cH).padStart(2, '0');
    document.getElementById('cdM').textContent = String(cM).padStart(2, '0');
    document.getElementById('cdS').textContent = String(cS).padStart(2, '0');
}, 1000);

/* â”€â”€ NEWSLETTER â”€â”€ */
document.getElementById('nlBtn').addEventListener('click', function() {
    var email = document.getElementById('nlEmail').value;
    if (email && email.includes('@')) {
        var btn = this;
        btn.textContent = 'âœ“ Subscribed!';
        btn.style.background = '#4ade80';
        btn.style.color = '#222';
        document.getElementById('nlEmail').value = '';
        setTimeout(function() {
            btn.textContent = 'Subscribe';
            btn.style.background = '';
            btn.style.color = '';
        }, 3000);
    }
});

/*  NUMBER COUNTER ANIMATION*/
var numAnimated = false;
window.addEventListener('scroll', function() {
    var hero = document.getElementById('hero');
    if (!numAnimated && hero && window.scrollY > hero.offsetHeight - 300) {
        numAnimated = true;
        document.querySelectorAll('.snum').forEach(function(el) {
            var txt = el.textContent;
            var num = parseInt(txt);
            var suf = txt.replace(/[0-9]/g, '');
            if (isNaN(num)) return;
            var start = 0;
            var step = Math.ceil(num / 55);
            var iv = setInterval(function() {
                start += step;
                if (start >= num) {
                    start = num;
                    clearInterval(iv);
                }
                el.textContent = start + suf;
            }, 1400 / 55);
        });
    }
});

apiRequest('/api/cart').then(syncCart).catch(function() {});
if (authToken) {
    apiRequest('/api/me').then(function(data) {
        currentUser = data.user;
        isLoggedIn = true;
        updateAccountDashboard();
    }).catch(function() {
        authToken = '';
        isLoggedIn = false;
        localStorage.removeItem('patriaAuthToken');
    });
}

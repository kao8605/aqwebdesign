// to get current year
function getYear() {
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    var displayYear = document.querySelector("#displayYear");
    if (displayYear) displayYear.innerHTML = currentYear;
}

getYear();


// isotope js
$(window).on('load', function () {
    if (!$.fn.isotope) return;

    $('.filters_menu li').click(function () {
        $('.filters_menu li').removeClass('active');
        $(this).addClass('active');

        var data = $(this).attr('data-filter');
        $grid.isotope({
            filter: data
        })
    });

    var $grid = $(".grid").isotope({
        itemSelector: ".all",
        percentPosition: false,
        masonry: {
            columnWidth: ".all"
        }
    })
});

// nice select
$(document).ready(function() {
    if ($.fn.niceSelect) $('select').niceSelect();
  });

/** google_map js **/
function myMap() {
    if (!window.google || !document.getElementById("googleMap")) return;
    var mapProp = {
        center: new google.maps.LatLng(40.712775, -74.005973),
        zoom: 18,
    };
    var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
}

// client section owl carousel
if ($.fn.owlCarousel) {
    $(".client_owl-carousel").owlCarousel({
        loop: true,
        margin: 0,
        dots: false,
        nav: true,
        navText: [],
        autoplay: true,
        autoplayHoverPause: true,
        navText: [
            '<i class="fa fa-angle-left" aria-hidden="true"></i>',
            '<i class="fa fa-angle-right" aria-hidden="true"></i>'
        ],
        responsive: {
            0: {
                items: 1
            },
            768: {
                items: 2
            },
            1000: {
                items: 2
            }
        }
    });
}

// Static demo interactions. These make the template feel connected without a backend.
(function () {
    var CART_KEY = "farcimenDemoCart";
    var BOOKING_KEY = "farcimenDemoBookings";
    var ORDERS_KEY = "farcimenDemoOrders";

    function getCart() {
        try {
            return JSON.parse(localStorage.getItem(CART_KEY)) || [];
        } catch (error) {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        renderCartCount();
    }

    function getBookings() {
        try {
            return JSON.parse(localStorage.getItem(BOOKING_KEY)) || [];
        } catch (error) {
            return [];
        }
    }

    function saveBookings(bookings) {
        localStorage.setItem(BOOKING_KEY, JSON.stringify(bookings));
    }

    function getOrders() {
        try {
            return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
        } catch (error) {
            return [];
        }
    }

    function saveOrders(orders) {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }

    function money(value) {
        return "$" + Number(value || 0).toFixed(2);
    }

    function toast(message) {
        var el = document.querySelector(".farcimen-toast");
        if (!el) {
            el = document.createElement("div");
            el.className = "farcimen-toast";
            document.body.appendChild(el);
        }
        el.textContent = message;
        el.classList.add("show");
        clearTimeout(el._timer);
        el._timer = setTimeout(function () {
            el.classList.remove("show");
        }, 2200);
    }

    function ensureDemoStyles() {
        if (document.getElementById("farcimen-demo-style")) return;
        var style = document.createElement("style");
        style.id = "farcimen-demo-style";
        style.textContent = [
            ".cart_link{position:relative;}",
            ".staff_dashboard_link{color:#fff;margin:0 10px;font-size:18px;}",
            ".header_section.header_inner .staff_dashboard_link,.sub_page .header_section .staff_dashboard_link{color:#222831;}",
            ".farcimen-cart-count{position:absolute;right:-10px;top:-10px;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:#ffbe33;color:#222;font-size:11px;line-height:18px;text-align:center;font-weight:700;}",
            ".farcimen-toast{position:fixed;left:50%;bottom:28px;z-index:9999;transform:translate(-50%,20px);background:#222831;color:#fff;padding:12px 18px;border-radius:999px;box-shadow:0 12px 30px rgba(0,0,0,.24);opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease;font-size:14px;}",
            ".farcimen-toast.show{opacity:1;transform:translate(-50%,0);}",
            ".farcimen-modal{position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;padding:20px;}",
            ".farcimen-modal.show{display:flex;}",
            ".farcimen-modal-card{width:min(520px,100%);max-height:86vh;overflow:auto;background:#fff;border-radius:12px;padding:24px;box-shadow:0 24px 70px rgba(0,0,0,.3);}",
            ".farcimen-modal-card.is-product{width:min(1040px,calc(100vw - 56px));padding:0;border-radius:18px;overflow:hidden;}",
            ".farcimen-modal-head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px;}",
            ".farcimen-modal-card.is-product .farcimen-modal-head{position:absolute;right:18px;top:18px;z-index:2;margin:0;}",
            ".farcimen-modal-card.is-product .farcimen-modal-head h3{display:none;}",
            ".farcimen-modal-head h3{margin:0;font-family:'Dancing Script',cursive;font-size:32px;color:#222831;}",
            ".farcimen-modal-close{border:0;background:#f1f1f1;width:36px;height:36px;border-radius:50%;font-size:22px;line-height:1;cursor:pointer;}",
            ".farcimen-product-modal{display:grid;grid-template-columns:0.95fr 1.05fr;min-height:500px;}",
            ".farcimen-product-image{min-height:500px;background:#111;}",
            ".farcimen-product-image img{width:100%;height:100%;object-fit:cover;display:block;}",
            ".farcimen-product-detail{padding:38px 44px 34px;display:flex;flex-direction:column;justify-content:center;}",
            ".farcimen-product-kicker{margin-bottom:12px;color:#ffbe33;font-weight:800;letter-spacing:2px;text-transform:uppercase;font-size:13px;}",
            ".farcimen-product-detail h4{margin:0 0 12px;font-family:'Dancing Script',cursive;font-size:46px;line-height:1;color:#222831;}",
            ".farcimen-product-rating{margin-bottom:16px;color:#ffbe33;font-weight:700;}",
            ".farcimen-product-rating span{color:#b8b8b8;font-weight:500;margin-left:8px;}",
            ".farcimen-product-desc{color:#777;font-size:16px;line-height:1.55;margin:0 0 18px;}",
            ".farcimen-product-price{display:flex;align-items:flex-end;gap:14px;margin-bottom:18px;}",
            ".farcimen-product-price strong{color:#ff2a22;font-family:'Dancing Script',cursive;font-size:42px;line-height:1;}",
            ".farcimen-product-price del{color:#b8b8b8;font-weight:800;font-size:20px;}",
            ".farcimen-product-stats{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px;}",
            ".farcimen-product-stat{min-width:100px;background:#faf5ef;border-radius:10px;padding:10px;text-align:center;}",
            ".farcimen-product-stat strong{display:block;color:#222831;font-size:18px;}",
            ".farcimen-product-stat span{color:#aaa;font-size:13px;}",
            ".farcimen-product-qty{display:flex;align-items:center;gap:16px;margin-bottom:18px;}",
            ".farcimen-product-qty button{width:38px;height:38px;border-radius:50%;border:2px solid #ff2a22;background:#fff;color:#ff2a22;font-size:22px;font-weight:800;line-height:1;cursor:pointer;}",
            ".farcimen-product-qty strong{font-size:24px;min-width:26px;text-align:center;}",
            ".farcimen-product-qty span{color:#aaa;font-size:18px;}",
            ".farcimen-product-tags{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;}",
            ".farcimen-product-tags span{background:#faf5ef;border-radius:999px;padding:7px 16px;color:#222831;font-weight:800;font-size:12px;}",
            ".farcimen-product-add{width:100%;border:0;border-radius:12px;background:#ef241c;color:#fff;padding:15px 20px;font-size:20px;font-weight:800;cursor:pointer;}",
            ".food_section .box{cursor:pointer;}",
            "@media (max-width: 767px){.farcimen-modal{padding:14px;}.farcimen-modal-card.is-product{width:100%;}.farcimen-product-modal{grid-template-columns:1fr;}.farcimen-product-image{min-height:260px;}.farcimen-product-detail{padding:30px 24px 28px;}.farcimen-product-detail h4{font-size:38px;}.farcimen-product-desc{font-size:16px;}.farcimen-product-price strong{font-size:40px;}}",
            ".farcimen-cart-row{display:grid;grid-template-columns:1fr auto;gap:8px 14px;padding:12px 0;border-bottom:1px solid #eee;}",
            ".farcimen-cart-row strong{display:block;color:#222831;}",
            ".farcimen-cart-row small{color:#666;}",
            ".farcimen-cart-actions{grid-column:1/-1;display:flex;align-items:center;gap:8px;}",
            ".farcimen-cart-actions button,.farcimen-demo-btn{border:0;border-radius:999px;background:#ffbe33;color:#fff;padding:8px 14px;cursor:pointer;}",
            ".farcimen-cart-actions button[data-demo-cart-remove]{background:#222831;}",
            ".farcimen-cart-total{display:flex;justify-content:space-between;align-items:center;margin-top:16px;font-size:18px;font-weight:700;}",
            ".farcimen-demo-muted{color:#666;margin:0 0 14px;}",
            ".farcimen-form-message{margin-top:14px;color:#168a4a;font-weight:600;}"
        ].join("");
        document.head.appendChild(style);
    }

    function renderCartCount() {
        var link = document.querySelector(".cart_link");
        if (!link) return;
        var count = getCart().reduce(function (sum, item) {
            return sum + item.qty;
        }, 0);
        var badge = link.querySelector(".farcimen-cart-count");
        if (!badge) {
            badge = document.createElement("span");
            badge.className = "farcimen-cart-count";
            link.appendChild(badge);
        }
        badge.textContent = count;
        badge.style.display = count ? "block" : "none";
    }

    function ensureModal() {
        var modal = document.querySelector(".farcimen-modal");
        if (modal) return modal;
        modal = document.createElement("div");
        modal.className = "farcimen-modal";
        modal.innerHTML = '<div class="farcimen-modal-card"><div class="farcimen-modal-head"><h3></h3><button class="farcimen-modal-close" type="button" aria-label="Close">&times;</button></div><div class="farcimen-modal-body"></div></div>';
        modal.addEventListener("click", function (event) {
            if (event.target === modal || event.target.closest(".farcimen-modal-close")) {
                modal.classList.remove("show");
            }
        });
        document.body.appendChild(modal);
        return modal;
    }

    function openModal(title, html) {
        var modal = ensureModal();
        modal.querySelector(".farcimen-modal-card").classList.remove("is-product");
        modal.querySelector("h3").textContent = title;
        modal.querySelector(".farcimen-modal-body").innerHTML = html;
        modal.classList.add("show");
    }

    function openProductModal(product) {
        var modal = ensureModal();
        var card = modal.querySelector(".farcimen-modal-card");
        card.classList.add("is-product");
        modal.querySelector("h3").textContent = product.title;
        modal.querySelector(".farcimen-modal-body").innerHTML = [
            '<div class="farcimen-product-modal">',
            '<div class="farcimen-product-image"><img src="' + product.img + '" alt="' + product.title + '"></div>',
            '<div class="farcimen-product-detail">',
            '<div class="farcimen-product-kicker">' + product.category + '</div>',
            '<h4>' + product.title + '</h4>',
            '<div class="farcimen-product-rating">★★★★★ <span>4.9 (128 reviews)</span></div>',
            '<p class="farcimen-product-desc">' + product.desc + '</p>',
            '<div class="farcimen-product-price"><strong>' + money(product.price) + '</strong><del>' + money(product.price + 4) + '</del></div>',
            '<div class="farcimen-product-stats"><div class="farcimen-product-stat"><strong>620 kcal</strong><span>Calories</span></div><div class="farcimen-product-stat"><strong>12 min</strong><span>Prep Time</span></div><div class="farcimen-product-stat"><strong>4.9/5</strong><span>Rating</span></div></div>',
            '<div class="farcimen-product-qty"><button type="button" data-demo-product-dec>-</button><strong data-demo-product-qty>1</strong><button type="button" data-demo-product-inc>+</button><span>portion</span></div>',
            '<div class="farcimen-product-tags"><span>' + product.category + '</span><span>Local Favourite</span><span>Farcimen</span></div>',
            '<button class="farcimen-product-add" type="button" data-demo-product-add>Add to Cart</button>',
            '</div>',
            '</div>'
        ].join("");
        modal._activeProduct = product;
        modal.classList.add("show");
    }

    function getProductFromCard(card) {
        var box = card.closest(".food_section .box");
        if (!box) return null;
        var title = box.querySelector("h5") ? box.querySelector("h5").textContent.trim() : "Menu Item";
        var priceText = box.querySelector(".options h6") ? box.querySelector(".options h6").textContent.trim() : "$0";
        var img = box.querySelector("img") ? box.querySelector("img").getAttribute("src") : "";
        var category = "Menu";
        var item = box.closest(".food_section .all");
        if (item) {
            ["burger", "pizza", "pasta", "fries"].some(function (name) {
                if (item.classList.contains(name)) {
                    category = name;
                    return true;
                }
                return false;
            });
        }
        return {
            id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + priceText.replace(/[^0-9]/g, ""),
            title: title,
            price: Number(priceText.replace(/[^0-9.]/g, "")) || 0,
            img: img,
            category: category,
            desc: box.querySelector("p") ? box.querySelector("p").textContent.replace(/\s+/g, " ").trim() : "Freshly prepared with signature Farcimen flavours.",
            qty: 1
        };
    }

    function getOfferProductFromButton(link) {
        var box = link.closest(".offer_section .box");
        if (!box) return null;
        var title = box.querySelector("h5") ? box.querySelector("h5").textContent.trim() : "Special Deal";
        var discount = box.querySelector("h6") ? box.querySelector("h6").textContent.replace(/\s+/g, " ").trim() : "";
        var img = box.querySelector("img") ? box.querySelector("img").getAttribute("src") : "";
        return {
            id: "offer-" + title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            title: discount ? title + " (" + discount + ")" : title,
            price: 9.99,
            img: img,
            qty: 1
        };
    }

    function addToCart(product) {
        var cart = getCart();
        var existing = cart.find(function (item) { return item.id === product.id; });
        if (existing) existing.qty += product.qty || 1;
        else cart.push(product);
        saveCart(cart);
        toast(product.title + " added to cart.");
    }

    function showCart() {
        var cart = getCart();
        if (!cart.length) {
            openModal("Your Cart", '<p class="farcimen-demo-muted">Your cart is empty. Add menu items to preview checkout.</p><button class="farcimen-demo-btn" data-demo-scroll-menu>Browse Menu</button>');
            return;
        }
        var total = cart.reduce(function (sum, item) {
            return sum + item.price * item.qty;
        }, 0);
        var rows = cart.map(function (item, index) {
            return '<div class="farcimen-cart-row"><div><strong>' + item.title + '</strong><small>' + money(item.price) + ' x ' + item.qty + '</small></div><b>' + money(item.price * item.qty) + '</b><div class="farcimen-cart-actions"><button type="button" data-demo-cart-dec="' + index + '">-</button><span>' + item.qty + '</span><button type="button" data-demo-cart-inc="' + index + '">+</button><button type="button" data-demo-cart-remove="' + index + '">Remove</button></div></div>';
        }).join("");
        openModal("Your Cart", rows + '<div class="farcimen-cart-total"><span>Total</span><strong>' + money(total) + '</strong></div><button class="farcimen-demo-btn" type="button" data-demo-checkout style="margin-top:16px;">Checkout Demo</button>');
    }

    function changeCart(index, mode) {
        var cart = getCart();
        if (!cart[index]) return;
        if (mode === "inc") cart[index].qty += 1;
        if (mode === "dec") cart[index].qty = Math.max(1, cart[index].qty - 1);
        if (mode === "remove") cart.splice(index, 1);
        saveCart(cart);
        showCart();
    }

    function checkoutDemo() {
        var cart = getCart();
        if (!cart.length) return;
        var order = {
            id: "FC-" + Date.now().toString().slice(-6),
            customer: "Guest Customer",
            email: "guest@farcimen.demo",
            status: "Processing",
            items: cart,
            total: cart.reduce(function (sum, item) { return sum + item.price * item.qty; }, 0),
            time: new Date().toISOString()
        };
        var orders = getOrders();
        orders.unshift(order);
        saveOrders(orders);
        localStorage.setItem("farcimenDemoLastOrder", JSON.stringify(order));
        saveCart([]);
        openModal("Order Placed", '<p class="farcimen-demo-muted">Demo order <strong>' + order.id + '</strong> has been created locally.</p><p class="farcimen-demo-muted">Total: <strong>' + money(order.total) + '</strong></p>');
    }

    function showAccount() {
        var bookings = getBookings();
        var lastOrder = localStorage.getItem("farcimenDemoLastOrder");
        var orderText = lastOrder ? JSON.parse(lastOrder).id : "No demo order yet";
        openModal("Demo Account", '<p class="farcimen-demo-muted">Demo account: Guest Customer</p><p><strong>Last order:</strong> ' + orderText + '</p><p><strong>Saved bookings:</strong> ' + bookings.length + '</p><a class="farcimen-demo-btn" href="customer-dashboard.html" style="display:inline-block;margin-right:8px;">Customer Dashboard</a><button class="farcimen-demo-btn" data-demo-scroll-book>Book a Table</button>');
    }

    function scrollToSection(selector) {
        var section = document.querySelector(selector);
        if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function searchMenu() {
        var query = window.prompt("Search menu items");
        if (query === null) return;
        query = query.trim().toLowerCase();
        var items = Array.prototype.slice.call(document.querySelectorAll(".food_section .grid .all"));
        if (!items.length) {
            toast("Search is available on the menu page.");
            return;
        }
        if (!query) {
            items.forEach(function (item) { item.style.display = ""; });
            if (window.jQuery && $(".grid").data("isotope")) $(".grid").isotope("layout");
            toast("Showing all menu items.");
            return;
        }
        var matches = 0;
        items.forEach(function (item) {
            var matched = item.textContent.toLowerCase().indexOf(query) !== -1;
            item.style.display = matched ? "" : "none";
            if (matched) matches += 1;
        });
        scrollToSection(".food_section");
        toast(matches + " item(s) found.");
    }

    function filterMenuItems(filter) {
        var items = Array.prototype.slice.call(document.querySelectorAll(".food_section .grid .all"));
        items.forEach(function (item) {
            var shouldShow = filter === "*" || item.matches(filter);
            item.style.display = shouldShow ? "" : "none";
        });
        if (window.jQuery && $(".grid").data("isotope")) {
            $(".grid").isotope({ filter: filter });
        }
    }

    function connectMenuFilters() {
        document.querySelectorAll(".filters_menu li").forEach(function (item) {
            item.addEventListener("click", function () {
                document.querySelectorAll(".filters_menu li").forEach(function (filterItem) {
                    filterItem.classList.remove("active");
                });
                item.classList.add("active");
                filterMenuItems(item.getAttribute("data-filter") || "*");
            });
        });
    }

    function connectContactLinks() {
        var contactLinks = document.querySelectorAll(".footer_contact .contact_link_box a");
        if (contactLinks[0]) contactLinks[0].setAttribute("href", "https://maps.google.com/?q=Farcimen%20Restaurant");
        if (contactLinks[1]) contactLinks[1].setAttribute("href", "tel:+011234567890");
        if (contactLinks[2]) contactLinks[2].setAttribute("href", "mailto:demo@gmail.com");
        var footerLogo = document.querySelector(".footer-logo");
        if (footerLogo) footerLogo.setAttribute("href", "index.html");
        document.querySelectorAll(".footer_social a").forEach(function (link) {
            link.setAttribute("href", "#social-demo");
        });
    }

    function handleBookingForm() {
        var form = document.querySelector(".book_section form");
        if (!form) return;
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var fields = form.querySelectorAll("input, select");
            var booking = {
                name: fields[0] ? fields[0].value.trim() : "",
                phone: fields[1] ? fields[1].value.trim() : "",
                email: fields[2] ? fields[2].value.trim() : "",
                persons: fields[3] ? (fields[3].value || fields[3].options[fields[3].selectedIndex].text) : "",
                date: fields[4] ? fields[4].value : "",
                createdAt: new Date().toISOString()
            };
            if (!booking.name || !booking.phone || !booking.email || !booking.date) {
                toast("Please complete the booking form.");
                return;
            }
            var bookings = getBookings();
            bookings.push(booking);
            saveBookings(bookings);
            var message = form.querySelector(".farcimen-form-message");
            if (!message) {
                message = document.createElement("p");
                message.className = "farcimen-form-message";
                form.appendChild(message);
            }
            message.textContent = "Booking saved locally. We will contact you soon.";
            form.reset();
            if ($.fn.niceSelect) $("select").niceSelect("update");
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        ensureDemoStyles();
        renderCartCount();
        connectMenuFilters();
        connectContactLinks();
        handleBookingForm();

        var searchForm = document.querySelector(".user_option .form-inline");
        if (searchForm) {
            searchForm.addEventListener("submit", function (event) {
                event.preventDefault();
                searchMenu();
            });
        }

        document.addEventListener("click", function (event) {
            var link = event.target.closest("a");
            var button = event.target.closest("button");

            if (link && link.matches(".user_link")) {
                event.preventDefault();
                showAccount();
                return;
            }

            if (link && link.matches(".cart_link")) {
                event.preventDefault();
                showCart();
                return;
            }

            if (link && link.closest(".offer_section .box")) {
                event.preventDefault();
                var offerProduct = getOfferProductFromButton(link);
                if (offerProduct) addToCart(offerProduct);
                return;
            }

            if (link && link.matches(".order_online, .slider_section .btn1")) {
                event.preventDefault();
                scrollToSection(".food_section");
                return;
            }

            if (link && link.closest(".food_section .options")) {
                event.preventDefault();
                var product = getProductFromCard(link);
                if (product) openProductModal(product);
                return;
            }

            var foodCard = event.target.closest(".food_section .box");
            if (foodCard) {
                event.preventDefault();
                var cardProduct = getProductFromCard(foodCard);
                if (cardProduct) openProductModal(cardProduct);
                return;
            }

            if (link && link.textContent.trim().toLowerCase() === "view more") {
                event.preventDefault();
                scrollToSection(".food_section");
                toast("All menu items are shown in this demo.");
                return;
            }

            if (link && link.textContent.trim().toLowerCase() === "read more") {
                event.preventDefault();
                scrollToSection(".about_section");
                toast("This demo keeps the full story on the same page.");
                return;
            }

            if (link && link.getAttribute("href") === "#social-demo") {
                event.preventDefault();
                toast("Social link placeholder for demo.");
                return;
            }

            if (link && link.getAttribute("href") === "") {
                event.preventDefault();
                toast("Demo link connected.");
                return;
            }

            if (button && button.hasAttribute("data-demo-scroll-menu")) {
                event.preventDefault();
                ensureModal().classList.remove("show");
                scrollToSection(".food_section");
                return;
            }

            if (button && button.hasAttribute("data-demo-scroll-book")) {
                event.preventDefault();
                ensureModal().classList.remove("show");
                scrollToSection(".book_section");
                return;
            }

            if (button && button.hasAttribute("data-demo-checkout")) {
                event.preventDefault();
                checkoutDemo();
                return;
            }

            if (button && button.hasAttribute("data-demo-product-inc")) {
                event.preventDefault();
                var qtyEl = ensureModal().querySelector("[data-demo-product-qty]");
                if (qtyEl) qtyEl.textContent = Number(qtyEl.textContent || 1) + 1;
                return;
            }

            if (button && button.hasAttribute("data-demo-product-dec")) {
                event.preventDefault();
                var decQtyEl = ensureModal().querySelector("[data-demo-product-qty]");
                if (decQtyEl) decQtyEl.textContent = Math.max(1, Number(decQtyEl.textContent || 1) - 1);
                return;
            }

            if (button && button.hasAttribute("data-demo-product-add")) {
                event.preventDefault();
                var activeModal = ensureModal();
                var activeProduct = activeModal._activeProduct;
                var activeQty = activeModal.querySelector("[data-demo-product-qty]");
                if (activeProduct) {
                    activeProduct.qty = Number(activeQty ? activeQty.textContent : 1) || 1;
                    addToCart(activeProduct);
                    activeModal.classList.remove("show");
                }
                return;
            }

            if (button && button.hasAttribute("data-demo-cart-inc")) {
                event.preventDefault();
                changeCart(Number(button.getAttribute("data-demo-cart-inc")), "inc");
                return;
            }

            if (button && button.hasAttribute("data-demo-cart-dec")) {
                event.preventDefault();
                changeCart(Number(button.getAttribute("data-demo-cart-dec")), "dec");
                return;
            }

            if (button && button.hasAttribute("data-demo-cart-remove")) {
                event.preventDefault();
                changeCart(Number(button.getAttribute("data-demo-cart-remove")), "remove");
            }
        });
    });
})();

// کافه آرام - مدیریت سبد خرید و منوی موبایل
const cart = {};
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const cartMessage = document.getElementById("cartMessage");
const clearCartButton = document.getElementById("clearCart");
const cartOverlay = document.getElementById("cartOverlay");

function formatPrice(value) {
    return `${Number(value).toLocaleString("fa-IR")} تومان`;
}

function showMessage(message) {
    if (!cartMessage) return;
    cartMessage.textContent = message;
}

function openCart() {
    cartOverlay?.classList.add("is-open");
    cartOverlay?.setAttribute("aria-hidden", "false");
    document.body.classList.add("cart-open");
    document.getElementById("closeCart")?.focus();
}

function closeCart() {
    cartOverlay?.classList.remove("is-open");
    cartOverlay?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cart-open");
    document.getElementById("openCart")?.focus();
}

function renderCart() {
    if (!cartItems || !cartTotal || !cartCount) return;

    cartItems.innerHTML = "";
    let total = 0;
    let count = 0;

    Object.entries(cart).forEach(([id, item]) => {
        if (item.quantity <= 0) return;
        const subtotal = item.price * item.quantity;
        total += subtotal;
        count += item.quantity;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${formatPrice(item.price)}</td>
            <td>
                <div class="cart-controls">
                    <button type="button" class="quantity-btn decrease" data-id="${id}" aria-label="کم کردن تعداد">−</button>
                    <span>${item.quantity.toLocaleString("fa-IR")}</span>
                    <button type="button" class="quantity-btn increase" data-id="${id}" aria-label="زیاد کردن تعداد">+</button>
                </div>
            </td>
            <td>${formatPrice(subtotal)}</td>
            <td><button type="button" class="remove-item" data-id="${id}">حذف</button></td>
        `;
        cartItems.appendChild(row);
    });

    const empty = count === 0;
    document.getElementById("cartEmpty")?.classList.toggle("is-visible", empty);
    document.querySelector(".cart-table-wrapper")?.classList.toggle("is-empty", empty);
    cartItems.closest("table")?.classList.toggle("table-empty", empty);
    if (empty) {
        cartItems.innerHTML = '<tr><td colspan="5" class="empty-cart-cell">سبد خرید شما خالی است.</td></tr>';
    }

    cartTotal.textContent = formatPrice(total);
    cartCount.textContent = count.toLocaleString("fa-IR");
}

document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", () => {
        const { id, name } = button.dataset;
        const price = Number(button.dataset.price);
        const input = document.getElementById(`qty-${id}`);
        const quantity = input ? Number.parseInt(input.value, 10) : 1;

        if (!id || !name || !Number.isFinite(price) ||
            !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
            showMessage("لطفاً تعداد را بین ۱ تا ۲۰ وارد کن.");
            openCart();
            return;
        }

        if (!cart[id]) cart[id] = { name, price, quantity: 0 };
        if (cart[id].quantity + quantity > 20) {
            showMessage("حداکثر تعداد هر محصول در سبد ۲۰ عدد است.");
            openCart();
            return;
        }

        cart[id].quantity += quantity;
        renderCart();
        showMessage(`${name} به سبد خرید اضافه شد.`);
        if (input) input.value = "1";
    });
});

// کنترل‌های افزایش، کاهش و حذف با یک شنونده مشترک
cartItems?.addEventListener("click", event => {
    const button = event.target.closest("button[data-id]");
    if (!button) return;
    const id = button.dataset.id;
    if (!cart[id]) return;

    if (button.classList.contains("increase")) {
        if (cart[id].quantity < 20) cart[id].quantity++;
    } else if (button.classList.contains("decrease")) {
        cart[id].quantity--;
        if (cart[id].quantity <= 0) delete cart[id];
    } else if (button.classList.contains("remove-item")) {
        delete cart[id];
    }
    renderCart();
});

clearCartButton?.addEventListener("click", () => {
    Object.keys(cart).forEach(id => delete cart[id]);
    renderCart();
    showMessage("سبد خرید خالی شد.");
});

document.getElementById("openCart")?.addEventListener("click", openCart);
document.getElementById("closeCart")?.addEventListener("click", closeCart);
document.getElementById("continueShopping")?.addEventListener("click", closeCart);
document.getElementById("continueShoppingBottom")?.addEventListener("click", closeCart);

cartOverlay?.addEventListener("click", event => {
    if (event.target === cartOverlay) closeCart();
});
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && cartOverlay?.classList.contains("is-open")) closeCart();
});

// منوی موبایل
const menuToggle = document.getElementById("menuToggle");
const navbar = document.getElementById("navbar");
menuToggle?.addEventListener("click", () => {
    navbar?.classList.toggle("active");
});
navbar?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => navbar.classList.remove("active"));
});

// دکمه رفتن به منو و سال فوتر
document.getElementById("year")?.append(document.createTextNode(new Date().getFullYear()));
document.querySelector(".hero-button")?.addEventListener("click", event => {
    event.preventDefault();
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
});

renderCart();


// اسلایدشو صفحه اول: تعویض خودکار تصویر هر ۵ ثانیه
const heroSlides = Array.from(document.querySelectorAll(".hero-slide"));
const heroDots = Array.from(document.querySelectorAll(".hero-dot"));
let currentHeroSlide = 0;
let heroTimer;

function showHeroSlide(index) {
    if (!heroSlides.length) return;
    currentHeroSlide = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, i) => slide.classList.toggle("active", i === currentHeroSlide));
    heroDots.forEach((dot, i) => dot.classList.toggle("active", i === currentHeroSlide));
}
function startHeroSlideshow() {
    if (heroSlides.length < 2) return;
    clearInterval(heroTimer);
    heroTimer = setInterval(() => showHeroSlide(currentHeroSlide + 1), 5000);
}
heroDots.forEach(dot => {
    dot.addEventListener("click", () => {
        showHeroSlide(Number(dot.dataset.slide));
        startHeroSlideshow();
    });
});
startHeroSlideshow();

// فرم رزرو نمایشی؛ بدون اتصال به سرور، اطلاعات جایی ارسال نمی‌شود.
const reservationForm = document.getElementById("reservationForm");
reservationForm?.addEventListener("submit", event => {
    event.preventDefault();
    const message = document.getElementById("reservationMessage");
    if (!reservationForm.reportValidity()) return;
    message.textContent = "درخواست شما در این پیش‌نمایش ثبت نمایشی شد. برای رزرو واقعی، لازم است فرم به شماره تماس یا سامانه کافه متصل شود.";
    reservationForm.reset();
});

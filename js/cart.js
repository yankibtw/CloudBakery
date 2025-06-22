function showNotification(message = "🎉 Это уведомление!", type = "success") {
    const container = document.getElementById("notification-container");
    if (!container) {
        console.error("Контейнер notification-container не найден!");
        return;
    }
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.classList.add(type);
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-btn" onclick="this.closest('.notification').remove()">×</button>
    `;
    container.appendChild(notification);
    setTimeout(() => notification.classList.add("show"), 10);
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => notification.remove(), 400);
    }, 5000);
}

window.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'show-notification') {
        const { message, type } = event.data.payload;
        showNotification(message, type);
    }
});

window.addEventListener('message', (event) => {
    if (event.data?.action === 'close-delivery-modal') {
        const modal = document.getElementById('delivery-modal');
        if (modal) modal.style.display = 'none';
    }
});

window.addEventListener('message', (event) => {
    if (event.data?.action === 'reload-parent') {
        location.reload();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const cartContainer = document.getElementById('cart-items-container');
    const notAuthMessage = document.getElementById('nonAuth');
    const cartInfo = document.getElementById("cart-info");
    const orderBtn = document.querySelector('.exit-data .apply-button');
    const modalDelivery = document.getElementById('delivery-modal');

    if (orderBtn && modalDelivery) {
        orderBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modalDelivery.style.display = 'block';
        });
    }

    function calculateTotal() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    function renderCartItems() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const container = document.getElementById('cart-items-container');
        container.innerHTML = '';

        if (cart.length === 0) {
            container.innerHTML = '<h2 class="title" style="font-size: 24px;" id="nonAuth">Корзина пуста!</h2>';
            document.getElementById('cart-info').style.display = 'none';
            return;
        }

        cart.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            itemDiv.innerHTML = `
                <img src="${item.img}" alt="${item.name}">
                <div class="item-text-content">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                </div>
                <h3 class="item-price">${item.price * item.quantity} ₽</h3>
                <div class="qty-btn">
                    <button class="qty-decrease" data-index="${index}">-</button>
                    <p>${item.quantity}</p>
                    <button class="qty-increase" data-index="${index}">+</button>
                </div>
                <button class="trash-button" data-index="${index}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff69b4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            `;
            container.appendChild(itemDiv);
        });

        const totalSum = calculateTotal();
        const totalElem = document.querySelector('.exit-data mark');
        if (totalElem) {
            totalElem.textContent = totalSum.toLocaleString('ru-RU') + ' ₽';
        }

        attachCartListeners();
    }

    function attachCartListeners() {
        document.querySelectorAll('.qty-increase').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.dataset.index;
                updateQuantity(index, 1);
            });
        });

        document.querySelectorAll('.qty-decrease').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.dataset.index;
                updateQuantity(index, -1);
            });
        });

        document.querySelectorAll('.trash-button').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.dataset.index;
                removeCartItem(index);
            });
        });
    }

    function updateQuantity(index, delta) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (!cart[index]) return;
        cart[index].quantity += delta;
        if (cart[index].quantity < 1) cart[index].quantity = 1;
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
    }

    function removeCartItem(index) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
    }

    if (isLoggedIn) {
        cartContainer.style.display = 'block';
        if (notAuthMessage) notAuthMessage.style.display = 'none';
        renderCartItems();
    } else {
        cartContainer.style.display = 'none';
        if (cartInfo) cartInfo.style.display = 'none';
        if (notAuthMessage) notAuthMessage.style.display = 'block';
    }
});
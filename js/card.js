window.addEventListener('message', (event) => {
if (event.data.action === 'show-product') {
    const product = event.data.product;

    document.querySelector('.card-title h1').textContent = product.name;

    const img = document.querySelector('.card-main-content img');
    img.src = product.img;
    img.alt = product.name;

    document.querySelector('.card-text-content h3').textContent = product.description;

    const ul = document.querySelector('.card-structure-list');
    ul.innerHTML = '';

    if (Array.isArray(product.composition) && product.composition.length > 0) {
    product.composition.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        ul.appendChild(li);
    });
    } else {
    ul.innerHTML = '<li>Состав не указан</li>';
    }

    const kbju = document.getElementById('kbju');
    kbju.textContent = `${product.weight}г, ккал ${product.calories}`;

    window.currentProduct = product;
    quantity = 1;
    updatePrice(); 

    document.querySelector('.qty-btn p').textContent = '1';
    document.querySelector('.card-product-cost').textContent = `${product.price}₽`;
}
});

let quantity = 1;
const priceElement = document.querySelector('.card-product-cost');
const qtyText = document.querySelector('.qty-btn p');
const btnMinus = document.querySelector('.qty-btn button:first-child');
const btnPlus = document.querySelector('.qty-btn button:last-child');

function updatePrice() {
    if (!window.currentProduct || typeof window.currentProduct.price !== 'number') return;
    const price = window.currentProduct.price;
    priceElement.textContent = `${price * quantity}₽`;
    qtyText.textContent = quantity;
}

btnMinus.addEventListener('click', () => {
    if (quantity > 1) {
        quantity--;
        updatePrice();
    }
});

btnPlus.addEventListener('click', () => {
    quantity++;
    updatePrice();
});

document.getElementById('close-product-modal').addEventListener('click', () => {
    window.parent.postMessage({ action: 'close-product-modal' }, '*');
});

document.getElementById('add-btn').addEventListener('click', () => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

    if (!isLoggedIn) {
        window.parent.postMessage({
            action: "show-notification",
            payload: {
                message: `Пожалуйста, войдите в аккаунт, чтобы добавить товар в корзину.`,
                type: "warning"
            }
        }, "*");
        return;
    }

    if (!window.currentProduct) {
        window.parent.postMessage({
            action: "show-notification",
            payload: {
                message: `Ошибка: товар не выбран!`,
                type: "error"
            }
        }, "*");
        return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existingItemIndex = cart.findIndex(item => item.id === window.currentProduct.id);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({
            id: window.currentProduct.id,
            name: window.currentProduct.name,
            description: window.currentProduct.description,
            price: window.currentProduct.price,
            quantity: quantity,
            img: window.currentProduct.img
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.parent.postMessage({
        action: "show-notification",
        payload: {
            message: `Товар "${window.currentProduct.name}" добавлен в корзину (${quantity} шт.)`,
            type: "success"
        }
    }, "*");

    window.parent.postMessage({ action: 'close-product-modal' }, '*');
});


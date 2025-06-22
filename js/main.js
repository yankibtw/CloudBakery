async function fetchProducts() {
  try {
    const response = await fetch('https://684e7f07f0c9c9848d284a6a.mockapi.io/api/vs1/product');
    if (!response.ok) throw new Error('Ошибка при загрузке товаров');
    return await response.json();
  } catch (e) {
    console.error(e);
    return [];
  }
}

function getRandomProducts(arr, count = 8) {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function renderRandomProducts() {
  const products = await fetchProducts();
  const randomProducts = getRandomProducts(products, 8);
  const container = document.querySelector('.recomendations-content .products-container');
  if (!container) return;
  container.innerHTML = '';
  randomProducts.forEach(product => {
    const productDiv = document.createElement('div');
    productDiv.className = 'product';
    productDiv.innerHTML = `
      <img src="${product.img}" alt="${product.name}">
      <a href="catalog.html"><h1>${product.name}</h1></a>
      <h2>${product.price} ₽</h2>
    `;
    container.appendChild(productDiv);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderRandomProducts();
});

window.addEventListener('message', (event) => {
    if (event.data.action === 'show-notification') {
        const { message, type } = event.data.payload;
        showNotification(message, type);
    }
});

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

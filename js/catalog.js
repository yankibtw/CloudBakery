async function fetchProducts() {
  try {
    const response = await fetch('https://684e7f07f0c9c9848d284a6a.mockapi.io/api/vs1/product');
    if (!response.ok) throw new Error('Ошибка при загрузке товаров');
    return await response.json();
  } catch {
    return [];
  }
}

window.addEventListener('message', event => {
  if (event.data.action === 'close-product-modal') {
    const modal = document.getElementById('product-modal');
    if (modal) modal.style.display = 'none';
  }
});

function renderCart(products) {
  const container = document.getElementById('products-container');
  container.innerHTML = '';
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product">
        <img src="${product.img}" alt="">
        <h1>${product.name}</h1>
        <p>${product.description}</p>
        <div class="text-content">
          <h2>${product.price} ₽</h2>
          <a href="#" class="open-modal" data-id="${product.id}">
            <img src="../img/shopping-cart.png" alt="Добавить в корзину">
          </a>
        </div>  
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('.open-modal').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const id = e.currentTarget.dataset.id;
      const product = products.find(p => p.id === id);
      if (product) openProductModal(product);
    });
  });
}

function openProductModal(product) {
  const modal = document.getElementById('product-modal');
  if (!modal) return;
  modal.style.display = 'block';
  const iframe = modal.querySelector('iframe');
  iframe.contentWindow.postMessage({ action: 'show-product', product }, '*');
}

let allProducts = [];
let currentProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
  allProducts = await fetchProducts();
  currentProducts = [...allProducts];
  renderCart(currentProducts);

  const searchInput = document.querySelector('.seach-form input');
  const sortBtn = document.querySelector('.seach-form a');
  const categoryButtons = document.querySelectorAll('.nav-categories-list button');

  let activeCategory = '';

  function filterProducts() {
    let filtered = allProducts;

    if (activeCategory && activeCategory !== 'Все') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    const query = searchInput.value.toLowerCase().trim();
    if (query) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
    }

    currentProducts = filtered;
    renderCart(currentProducts);
  }

  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const clickedCategory = btn.textContent.trim();

      if (activeCategory === clickedCategory) {
        activeCategory = '';
        btn.id = '';
        categoryButtons.forEach(b => b.id = ''); 
      } else {
        categoryButtons.forEach(b => b.id = '');
        btn.id = 'active';
        activeCategory = clickedCategory;
      }

      filterProducts();
    });
  });

  searchInput.addEventListener('input', () => {
    filterProducts();
  });

  sortBtn.addEventListener('click', e => {
    e.preventDefault();
    currentProducts.sort((a, b) => a.price - b.price);
    renderCart(currentProducts);
  });

  const allBtn = Array.from(categoryButtons).find(btn => btn.textContent.trim() === 'Все');
  if (allBtn) {
    allBtn.id = 'active';
    activeCategory = '';
  }

  filterProducts();

});

window.addEventListener('message', (event) => {
    if (event.data.action === 'show-notification') {
        const { message, type } = event.data.payload;
        showNotification(message, type);
    }
});

function showNotification(message = "", type = "success") {
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

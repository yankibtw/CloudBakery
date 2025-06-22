document.getElementById('close-delivery-modal').addEventListener('click', () => {
    window.parent.postMessage({ action: 'close-delivery-modal' }, '*');
});

document.addEventListener('DOMContentLoaded', function () {
  const pickupRadio = document.querySelector('input[value="pickup"]');
  const deliveryRadio = document.querySelector('input[value="delivery"]');
  const addressFields = document.getElementById('addressFields');
  const extraFields = document.getElementById('extraFields');
  const submitBtn = document.querySelector('.delivery-form__submit');

  const nameInput = document.querySelector('input[placeholder="Ваше имя"]');
  const phoneInput = document.querySelector('input[placeholder="Телефон"]');
  const addressInput = addressFields.querySelector('input');
  const floorInput = extraFields.children[0];
  const intercomInput = extraFields.children[1];
  
  toggleAddressFields(deliveryRadio.checked);

    function toggleAddressFields(show) {
    if (show) {
        addressFields.classList.add('show');
        extraFields.classList.add('show');
    } else {
        addressFields.classList.remove('show');
        extraFields.classList.remove('show');
    }
    }


  pickupRadio.addEventListener('change', () => toggleAddressFields(false));
  deliveryRadio.addEventListener('change', () => toggleAddressFields(true));

    function validateForm() {
    const nameRegex = /^[А-Яа-яЁёA-Za-z\s\-]{2,}$/;
    const phoneRegex = /^\+?[78]?[()\-\s]?\d{3}[()\-\s]?\d{3}[()\-\s]?\d{2}[()\-\s]?\d{2}$/;

    if (!nameInput.value.trim()) {
        window.parent.postMessage({
          action: "show-notification",
          payload: {
              message: `Пожалуйста, введите имя!`,
              type: "warning"
          }
        }, "*");
        return false;
    }
    if (!nameRegex.test(nameInput.value.trim())) {
        window.parent.postMessage({
          action: "show-notification",
          payload: {
              message: `Имя должно содержать только буквы и быть не короче 2 символов!`,
              type: "warning"
          }
        }, "*");
        return false;
    }

    if (!phoneInput.value.trim()) {
        window.parent.postMessage({
          action: "show-notification",
          payload: {
              message: `Пожалуйста, введите телефон!`,
              type: "warning"
          }
        }, "*");
        return false;
    }
    if (!phoneRegex.test(phoneInput.value.trim())) {
        window.parent.postMessage({
          action: "show-notification",
          payload: {
              message: `Введите корректный номер телефона (например, +7 999 123-45-67)!`,
              type: "error"
          }
        }, "*");
        return false;
    }

    if (deliveryRadio.checked) {
        if (!addressInput.value.trim() || addressInput.value.trim().length < 5) {
        window.parent.postMessage({
          action: "show-notification",
          payload: {
              message: `Введите полный адрес доставки (минимум 5 символов)!`,
              type: "error"
          }
        }, "*");
        return false;
        }
    }

    if (floorInput.value && floorInput.value.length > 10) {
        window.parent.postMessage({
          action: "show-notification",
          payload: {
              message: `Слишком длинное значение в поле "Этаж"!`,
              type: "error"
          }
        }, "*");
        return false;
    }

    if (intercomInput.value && intercomInput.value.length > 10) {
        window.parent.postMessage({
          action: "show-notification",
          payload: {
              message: `Слишком длинное значение в поле "Домофон"!`,
              type: "error"
          }
        }, "*");
        return false;
    }

    return true;
    }

  async function sendOrder(orderData) {
    try {
      const response = await fetch('https://684ead02f0c9c9848d28c6c6.mockapi.io/api/vs1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      if (!response.ok) throw new Error('Ошибка отправки заказа');
      const result = await response.json();
      window.parent.postMessage({
        action: "show-notification",
        payload: {
          message: `Заказ успешно оформлен!`,
          type: "success"
        }
      }, "*");

      window.parent.postMessage({ action: 'close-delivery-modal' }, '*');
      localStorage.removeItem('cart');

      setTimeout(() => {
        window.parent.postMessage({ action: 'reload-parent' }, '*');
      }, 100); 

      return true;
    } catch (error) {
        window.parent.postMessage({
          action: "show-notification",
          payload: {
              message: `Ошибка при оформлении заказа!`,
              type: "error"
          }
        }, "*");
        return false;
    }
  }

  submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
      window.parent.postMessage({
        action: "show-notification",
        payload: {
            message: `Корзина пуста!`,
            type: "warning"
        }
      }, "*");
      return;
    }

    const orderData = {
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      deliveryType: deliveryRadio.checked ? 'delivery' : 'pickup',
      address: deliveryRadio.checked ? addressInput.value.trim() : '',
      floor: deliveryRadio.checked ? floorInput.value.trim() : '',
      intercom: deliveryRadio.checked ? intercomInput.value.trim() : '',
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalPrice: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    };

    await sendOrder(orderData);
  });
});
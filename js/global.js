document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-button");
  const modal = document.getElementById("modal");

  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

  function updateLoginButton() {
    if (sessionStorage.getItem("isLoggedIn") === "true") {
      loginBtn.textContent = "Выход";
    } else {
      loginBtn.textContent = "Вход";
    }
  }

  updateLoginButton();

  loginBtn.addEventListener("click", () => {
    if (sessionStorage.getItem("isLoggedIn") === "true") {
      sessionStorage.clear();
      updateLoginButton();
      location.reload();
    } else {
      modal.style.display = "flex";
    }
  });

  window.addEventListener("message", (event) => {
    if (event.data.action === "close-modal") {
      modal.style.display = "none";
      location.reload();
    }
  });

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

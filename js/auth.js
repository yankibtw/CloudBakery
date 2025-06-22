document.addEventListener("DOMContentLoaded", function () {
    const phoneInput = document.getElementById("phone");

    if (phoneInput) {
        phoneInput.value = "+7 ";

        function applyPhoneMask(input) {
            let value = input.value.replace(/[^\d]/g, "");

            if (value.startsWith("8")) {
                value = "7" + value.slice(1);
            }

            if (!value.startsWith("7")) {
                value = "7" + value;
            }

            value = value.slice(0, 11);
            let result = "+7 ";
            let pattern = value.slice(1);

            if (pattern.length > 0) result += pattern.slice(0, 3);
            if (pattern.length >= 4) result += " " + pattern.slice(3, 6);
            if (pattern.length >= 7) result += "-" + pattern.slice(6, 8);
            if (pattern.length >= 9) result += "-" + pattern.slice(8, 10);

            input.value = result;

            setTimeout(() => {
                const pos = input.value.length;
                input.setSelectionRange(pos, pos);
            }, 0);
        }

        phoneInput.addEventListener("input", (e) => {
            applyPhoneMask(e.target);
        });

        phoneInput.addEventListener("focus", (e) => {
            if (!e.target.value || e.target.value === "+7 ") {
                e.target.value = "+7 ";
            }
            setTimeout(() => {
                const pos = e.target.value.length;
                e.target.setSelectionRange(pos, pos);
            }, 0);
        });

        phoneInput.addEventListener("click", (e) => {
            setTimeout(() => {
                const pos = e.target.value.length;
                e.target.setSelectionRange(pos, pos);
            }, 0);
        });

        phoneInput.addEventListener("keydown", (e) => {
            const value = e.target.value;
            const pos = e.target.selectionStart;

            if ((pos < 3 || pos > value.length) && !["Backspace", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                e.preventDefault();
            }

            if (["Backspace", "Delete"].includes(e.key) && value.replace(/[^\d]/g, "").length <= 1) {
                setTimeout(() => {
                    e.target.value = "+7 ";
                    e.target.setSelectionRange(3, 3);
                }, 0);
            }
        });

        phoneInput.addEventListener("paste", (e) => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData("text/plain").replace(/[^\d]/g, "");
            let value = pastedText;

            if (value.startsWith("8")) {
                value = "7" + value.slice(1);
            }

            if (!value.startsWith("7")) {
                value = "7" + value;
            }

            value = value.slice(0, 11);
            phoneInput.value = "+7 ";
            phoneInput.value += value.slice(1);
            applyPhoneMask(phoneInput);
        });
    }

    document.getElementById("sendCodeBtn").addEventListener("click", async () => {
        const phoneInputEl = document.getElementById("phone");
        const phone = phoneInputEl.value.replace(/[^\d]/g, "");

        if (!phone) {
            window.parent.postMessage({
                action: "show-notification",
                payload: {
                    message: `Введите номер телефона!`,
                    type: "error"
                }
            }, "*");
            return;
        }

        if (!/^7\d{10}$/.test(phone)) {
            window.parent.postMessage({
                action: "show-notification",
                payload: {
                    message: `Введите корректный номер!\nФормат: +7 999 999-99-99`,
                    type: "error"
                }
            }, "*");
            return;
        }

        const code = Math.floor(1000 + Math.random() * 9000);

        try {
            const response = await fetch("https://684e7f07f0c9c9848d284a6a.mockapi.io/api/vs1/send-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, code, success: true, message: "Код успешно отправлен" })
            });

            const result = await response.json();

            if (result.success) {
                window.parent.postMessage({
                    action: "show-notification",
                    payload: {
                        message: `Код отправлен!\n(Для теста: ${code})`,
                        type: "success"
                    }
                }, "*");

                sessionStorage.setItem("auth_phone", phone);
                sessionStorage.setItem("auth_code", code);

                document.getElementById("phone-form").style.display = "none";
                document.getElementById("code-form").style.display = "flex";
                document.getElementById("shown-phone").textContent = phoneInputEl.value;
            }
        } catch (err) {
            window.parent.postMessage({
                action: "show-notification",
                payload: {
                    message: `Произошла ошибка при отправке!`,
                    type: "error"
                }
            }, "*");
        }
    });

    document.getElementById("authBtn").addEventListener("click", () => {
        const userCode = document.getElementById("code").value.trim();
        const codeSent = sessionStorage.getItem("auth_code");

        if (userCode === codeSent) {
            window.parent.postMessage({
                action: "show-notification",
                payload: {
                    message: `Вы успешно авторизировались!`,
                    type: "success"
                }
            }, "*");
            sessionStorage.setItem("isLoggedIn", "true");
            window.parent.postMessage({ action: "close-modal" }, "*");
        } else {
            window.parent.postMessage({
                action: "show-notification",
                payload: {
                    message: `Неверный код!`,
                    type: "error"
                }
            }, "*");
        }
    });

    document.getElementById("changePhoneBtn").addEventListener("click", () => {
        document.getElementById("code-form").style.display = "none";
        document.getElementById("phone-form").style.display = "block";
    });

    document.getElementById("close-modal").addEventListener("click", () => {
        window.parent.postMessage({ action: "close-modal" }, "*");
    });

    document.getElementById("close-modal-code").addEventListener("click", () => {
        window.parent.postMessage({ action: "close-modal" }, "*");
    });
});

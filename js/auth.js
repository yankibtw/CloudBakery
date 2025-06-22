document.addEventListener("DOMContentLoaded", function () {
    const phoneInput = document.getElementById("phone");

    if (phoneInput) {
        phoneInput.value = "+7 ";

        function applyPhoneMask(input) {
            let value = input.value.replace(/[^\d]/g, "");

            if (!value.startsWith("7")) {
                value = "7" + value;
            }

            let result = "";
            let mask = "+7 ___ ___-__-__";
            let current = 0;

            for (let char of mask) {
                if (current >= value.length) break;
                if (char === "_") {
                    result += value[current];
                    current++;
                } else {
                    result += char;
                }
            }

            const start = input.selectionStart;
            const end = input.selectionEnd;

            input.value = result;

            input.setSelectionRange(start, end);
        }

        phoneInput.addEventListener("input", (e) => {
            applyPhoneMask(e.target);
        });

        phoneInput.addEventListener("focus", (e) => {
            if (!e.target.value || e.target.value === "+7 ") {
                e.target.value = "+7 ";
                e.target.setSelectionRange(3, 3);
            }
        });

        phoneInput.addEventListener("click", (e) => {
            if (!e.target.value || e.target.value === "+7 ") {
                e.target.setSelectionRange(3, 3);
            }
        });

        phoneInput.addEventListener("keydown", (e) => {
            const value = e.target.value;
            const pos = e.target.selectionStart;

            if ((pos < 3 || pos > value.length) && e.key !== "Backspace" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
                e.preventDefault();
            }

            if ((e.key === "Backspace" || e.key === "Delete") && value.replace(/[^\d]/g, "").length <= 2) {
                setTimeout(() => {
                    e.target.value = "+7 ";
                    e.target.setSelectionRange(3, 3);
                }, 0);
            }
        });

        phoneInput.addEventListener("paste", (e) => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData("text/plain");
            const cleaned = pastedText.replace(/[^\d]/g, "");

            const currentValue = phoneInput.value.replace(/[^\d]/g, "");
            const startPos = phoneInput.selectionStart;
            const endPos = phoneInput.selectionEnd;

            const newValue = currentValue.slice(0, startPos) + cleaned + currentValue.slice(endPos);

            phoneInput.value = "";
            for (let i = 0; i < newValue.length; i++) {
                phoneInput.value += newValue[i];
                applyPhoneMask(phoneInput);
            }
        });
    }

    document.getElementById("sendCodeBtn").addEventListener("click", async () => {
        const phoneInputEl = document.getElementById("phone");
        const phone = phoneInputEl.value.replace(/[^\d]/g, "");

        if (!phone) {
            window.parent.postMessage(
                {
                    action: "show-notification",
                    payload: {
                        message: `Введите номер телефона!`,
                        type: "error"
                    }
                },
                "*"
            );
            return;
        }

        if (!/^7\d{10}$/.test(phone)) {
            window.parent.postMessage(
                {
                    action: "show-notification",
                    payload: {
                        message: `Введите корректный номер!\nФормат: +7 999 999-99-99`,
                        type: "error"
                    }
                },
                "*"
            );
            return;
        }

        const code = Math.floor(1000 + Math.random() * 9000);

        try {
            const response = await fetch("https://684e7f07f0c9c9848d284a6a.mockapi.io/api/vs1/send-code",  {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, code, success: true, message: "Код успешно отправлен" })
            });

            const result = await response.json();

            if (result.success) {
                window.parent.postMessage(
                    {
                        action: "show-notification",
                        payload: {
                            message: `Код отправлен!\n(Для теста: ${code})`,
                            type: "success"
                        }
                    },
                    "*"
                );

                sessionStorage.setItem("auth_phone", phone);
                sessionStorage.setItem("auth_code", code);

                document.getElementById("phone-form").style.display = "none";
                document.getElementById("code-form").style.display = "flex";
                document.getElementById("shown-phone").textContent = phoneInputEl.value;
            }
        } catch (err) {
            window.parent.postMessage(
                {
                    action: "show-notification",
                    payload: {
                        message: `Произошла ошибка при отправке!`,
                        type: "error"
                    }
                },
                "*"
            );
        }
    });

    document.getElementById("authBtn").addEventListener("click", () => {
        const userCode = document.getElementById("code").value.trim();
        const codeSent = sessionStorage.getItem("auth_code");

        if (userCode === codeSent) {
            window.parent.postMessage(
                {
                    action: "show-notification",
                    payload: {
                        message: `Вы успешно авторизировались!`,
                        type: "success"
                    }
                },
                "*"
            );
            sessionStorage.setItem("isLoggedIn", "true");
            window.parent.postMessage({ action: "close-modal" }, "*");
        } else {
            window.parent.postMessage(
                {
                    action: "show-notification",
                    payload: {
                        message: `Неверный код!`,
                        type: "error"
                    }
                },
                "*"
            );
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
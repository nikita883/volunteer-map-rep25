document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userGreeting = document.getElementById('userGreeting');
    const addNPOBtn = document.getElementById('addNPOBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const authModal = document.getElementById('authModal');
    const closeButtons = document.querySelectorAll('.close');
    const authFormContainer = document.getElementById('authFormContainer');

    // Проверка токена при загрузке
    const token = localStorage.getItem('token');
    if (token) {
        // Проверить валидность токена (опционально, можно проверить при вызове API)
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        userGreeting.style.display = 'inline-block';
        addNPOBtn.style.display = 'inline-block';
        // Получить имя пользователя из localStorage или вызвать API
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            userGreeting.textContent = `Привет, ${user.first_name || user.email}!`;
        }
    }

    loginBtn.addEventListener('click', () => {
        authFormContainer.innerHTML = `
            <h2>Вход</h2>
            <form id="loginForm">
                <input type="email" id="loginEmail" placeholder="Email" required><br>
                <input type="password" id="loginPassword" placeholder="Пароль" required><br>
                <button type="submit">Войти</button>
            </form>
            <p><a href="#" id="forgotPasswordLink">Забыли пароль?</a></p>
        `;
        authModal.style.display = 'block';
        modalOverlay.style.display = 'block';

        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const data = await window.api.login(email, password);
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.reload(); // Перезагрузка для обновления UI
            } catch (error) {
                alert(error.message);
            }
        });

        document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
            e.preventDefault();
            authFormContainer.innerHTML = `
                <h2>Восстановление пароля</h2>
                <form id="forgotPasswordForm">
                    <input type="email" id="forgotPasswordEmail" placeholder="Email" required><br>
                    <button type="submit">Отправить ссылку</button>
                </form>
                <p><a href="#" id="backToLogin">Назад ко входу</a></p>
            `;

            document.getElementById('forgotPasswordForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('forgotPasswordEmail').value;
                try {
                    await window.api.forgotPassword(email);
                    alert('Ссылка для восстановления отправлена на ваш email.');
                } catch (error) {
                    alert(error.message);
                }
            });

            document.getElementById('backToLogin').addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('loginBtn').click(); // Повторно открыть форму входа
            });
        });
    });

    registerBtn.addEventListener('click', () => {
        authFormContainer.innerHTML = `
            <h2>Регистрация</h2>
            <form id="registerForm">
                <input type="text" id="registerFirstName" placeholder="Имя"><br>
                <input type="text" id="registerLastName" placeholder="Фамилия"><br>
                <input type="email" id="registerEmail" placeholder="Email" required><br>
                <input type="password" id="registerPassword" placeholder="Пароль" required><br>
                <button type="submit">Зарегистрироваться</button>
            </form>
            <p><a href="#" id="backToLoginReg">Войти</a></p>
        `;
        authModal.style.display = 'block';
        modalOverlay.style.display = 'block';

        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const firstName = document.getElementById('registerFirstName').value;
            const lastName = document.getElementById('registerLastName').value;

            try {
                await window.api.register(email, password, firstName, lastName);
                alert('Регистрация успешна! Теперь вы можете войти.');
                document.getElementById('backToLoginReg').click(); // Перейти ко входу
            } catch (error) {
                alert(error.message);
            }
        });

        document.getElementById('backToLoginReg').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginBtn').click(); // Повторно открыть форму входа
        });
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            authModal.style.display = 'none';
            modalOverlay.style.display = 'none';
        });
    });

    modalOverlay.addEventListener('click', () => {
        authModal.style.display = 'none';
        modalOverlay.style.display = 'none';
    });
});
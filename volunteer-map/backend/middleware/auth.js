// js/auth.js — ПРОСТАЯ АВТОРИЗАЦИЯ ДЛЯ ФРОНТЕНДА

// === Функция: обновить интерфейс после входа/выхода ===
function updateAuthUI() {
    const isLoggedIn = !!localStorage.getItem('authToken');
    const addBtn = document.getElementById('addNPOBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userGreeting = document.getElementById('userGreeting');

    if (isLoggedIn) {
        addBtn.style.display = 'inline-flex';
        logoutBtn.style.display = 'inline-flex';
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        userGreeting.textContent = `Привет, ${user.name || 'Друг'}!`;
        userGreeting.style.display = 'inline';
    } else {
        addBtn.style.display = 'none';
        logoutBtn.style.display = 'none';
        loginBtn.style.display = 'inline-flex';
        registerBtn.style.display = 'inline-flex';
        userGreeting.style.display = 'none';
    }
}

// === ЛОГИН (демо) ===
document.getElementById('loginBtn')?.addEventListener('click', () => {
    openAuthModal('login');
});

// === РЕГИСТРАЦИЯ (демо) ===
document.getElementById('registerBtn')?.addEventListener('click', () => {
    openAuthModal('register');
});

// === ВЫХОД ===
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    updateAuthUI();
    closeAllModals();
    showNotification('Вы вышли из аккаунта', 'info');
});

// === Открытие модалки авторизации ===
function openAuthModal(mode) {
    const container = document.getElementById('authFormContainer');
    container.innerHTML = '';

    const isLogin = mode === 'login';
    const title = isLogin ? 'Вход' : 'Регистрация';
    const btnText = isLogin ? 'Войти' : 'Зарегистрироваться';

    container.innerHTML = `
        <h2>${title}</h2>
        <form id="authForm">
            <div class="form-group">
                <label>Имя</label>
                <input type="text" id="nameInput" placeholder="Иван" required>
            </div>
            ${!isLogin ? '' : `
            <div class="form-group">
                <label>Пароль</label>
                <input type="password" id="passInput" placeholder="••••••" required>
            </div>`}
            <button type="submit" class="submit-btn">${btnText}</button>
            <div class="form-switch">
                <a href="#" id="switchMode">
                    ${isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
                </a>
            </div>
        </form>
    `;

    // Переключение между логином и регистрацией
    document.getElementById('switchMode').addEventListener('click', (e) => {
        e.preventDefault();
        openAuthModal(isLogin ? 'register' : 'login');
    });

    // Обработка формы
    document.getElementById('authForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('nameInput').value.trim();

        if (!name) {
            showNotification('Введите имя', 'error');
            return;
        }

        // ДЕМО: просто сохраняем в localStorage
        localStorage.setItem('authToken', 'demo-jwt-token-123');
        localStorage.setItem('user', JSON.stringify({ name }));

        updateAuthUI();
        closeAllModals();
        showNotification(`Добро пожаловать, ${name}!`, 'success');
    });

    // Показать модалку
    document.getElementById('authModal').classList.add('active');
    document.getElementById('modalOverlay').classList.add('active');
}

// === ЗАКРЫТИЕ ВСЕХ МОДАЛОК ===
function closeAllModals() {
    document.querySelectorAll('.modal, .modal-overlay').forEach(el => {
        el.classList.remove('active');
    });
}

// === УВЕДОМЛЕНИЯ ===
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} show`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// === ЗАКРЫТИЕ ПО КЛИКУ НА ОВЕРЛЕЙ ИЛИ КРЕСТИК ===
document.querySelectorAll('.close, .modal-overlay').forEach(el => {
    el.addEventListener('click', closeAllModals);
});

// === Инициализация при загрузке ===
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();

    // Кнопка "Добавить НКО"
    document.getElementById('addNPOBtn')?.addEventListener('click', () => {
        document.getElementById('addNPOModal').classList.add('active');
        document.getElementById('modalOverlay').classList.add('active');
    });
});

// Экспорт для других модулей (если нужно)
window.auth = { updateAuthUI, closeAllModals };
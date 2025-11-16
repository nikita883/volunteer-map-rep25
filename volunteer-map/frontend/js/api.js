const API_BASE_URL = 'http://localhost:3000/api';

// Функция для выполнения запросов с токеном
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка запроса к API');
    }
    return response.json();
}

// Экспортируем функции для других скриптов
window.api = {
    login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (email, password, first_name, last_name) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, first_name, last_name }) }),
    forgotPassword: (email) => apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    getNPOs: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/npos${queryString ? '?' + queryString : ''}`);
    },
    addNPO: (formData) => {
        // Для multipart/form-data токен нужно передавать в заголовке, а formData не JSON
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Необходима авторизация');
        }
        return fetch(`${API_BASE_URL}/npos`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Ошибка добавления НКО');
            }
            return res.json();
        });
    },
    getUserProfile: () => apiRequest('/users/profile'),
};
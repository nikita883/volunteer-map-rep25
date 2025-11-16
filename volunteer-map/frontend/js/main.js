document.addEventListener('DOMContentLoaded', () => {
    const citySelect = document.getElementById('citySelect');
    const categorySelect = document.getElementById('categorySelect');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const addNPOBtn = document.getElementById('addNPOModal'); // Исправлено: ищем модальное окно
    const addNPOBtnTrigger = document.getElementById('addNPOBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeButtons = document.querySelectorAll('.close');

    // Заполнение списка городов
    const rosatomCities = [
        "Ангарск", "Иркутская область", "Байкальск", "Иркутская область", "Балаково", "Саратовская область",
        "Билибино", "Чукотский АО", "Волгодонск", "Ростовская область", "Глазов", "Удмуртская Республика",
        "Десногорск", "Смоленская область", "Димитровград", "Ульяновская область", "Железногорск", "Красноярский край",
        "ЗАТО Заречный", "Пензенская область", "Заречный", "Свердловская область", "Зеленогорск", "Красноярский край",
        "Краснокаменск", "Забайкальский край", "Курчатов", "Курская область", "Лесной", "Свердловская область",
        "Неман", "Калининградская область", "Нововоронеж", "Воронежская область", "Новоуральск", "Свердловская область",
        "Обнинск", "Калужская область", "Озерск", "Челябинская область", "Певек", "Чукотский АО",
        "Полярные Зори", "Мурманская область", "Саров", "Нижегородская область", "Северск", "Томская область",
        "Снежинск", "Челябинская область", "Советск", "Калининградская область", "Сосновый Бор", "Ленинградская область",
        "Трехгорный", "Челябинская область", "Удомля", "Тверская область", "Усолье-Сибирское", "Иркутская область",
        "Электросталь", "Московская область", "Энергодар", "Запорожская область"
    ];
    const uniqueCities = [...new Set(rosatomCities.map(c => c.split(',')[0].trim()))];
    uniqueCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });

    // Заполнение списка категорий (для фильтрации)
    const categories = ['Благотворительность', 'Экология', 'Образование', 'Культура', 'Социальная поддержка', 'Животные'];
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });

    // --- НОВЫЙ КОД: Заполняем список категорий в форме добавления НКО ---
    function populateCategorySelect() {
        const categorySelect = document.getElementById('npoCategoryInput');
        // Очищаем текущие опции (кроме первой)
        while (categorySelect.options.length > 1) {
            categorySelect.remove(1);
        }

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
    }

    // Вызываем функцию после загрузки страницы
    populateCategorySelect();
    // --- Конец нового кода ---

    // Поиск
    searchBtn.addEventListener('click', () => {
        const city = citySelect.value;
        const category = categorySelect.value;
        const search = searchInput.value;

        // Вызов функции обновления карты (см. map.js)
        window.updateMap(city, category, search);
    });

    // Добавить НКО
    addNPOBtnTrigger.addEventListener('click', () => {
        document.getElementById('addNPOModal').style.display = 'block';
        modalOverlay.style.display = 'block';
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.getElementById('addNPOModal').style.display = 'none';
            modalOverlay.style.display = 'none';
        });
    });

    modalOverlay.addEventListener('click', () => {
        document.getElementById('addNPOModal').style.display = 'none';
        modalOverlay.style.display = 'none';
    });

    // Обработка формы добавления НКО
    document.getElementById('addNPOForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', document.getElementById('npoNameInput').value);
        formData.append('category', document.getElementById('npoCategoryInput').value); // Теперь будет отправляться выбранное значение
        formData.append('description', document.getElementById('npoDescriptionInput').value);
        formData.append('phone', document.getElementById('npoPhoneInput').value);
        formData.append('address', document.getElementById('npoAddressInput').value);
        formData.append('website_url', document.getElementById('npoWebsiteInput').value);
        formData.append('social_links', document.getElementById('npoSocialLinksInput').value); // JSON строка
        formData.append('city', document.getElementById('npoCityInput').value);
        formData.append('latitude', parseFloat(document.getElementById('npoLatitudeInput').value));
        formData.append('longitude', parseFloat(document.getElementById('npoLongitudeInput').value));
        if (document.getElementById('npoLogoInput').files[0]) {
            formData.append('logo', document.getElementById('npoLogoInput').files[0]);
        }

        try {
            await window.api.addNPO(formData);
            alert('Заявка на добавление НКО отправлена на модерацию.');
            document.getElementById('addNPOForm').reset();
            document.getElementById('addNPOModal').style.display = 'none';
            modalOverlay.style.display = 'none';
            // Обновить карту
            window.updateMap();
        } catch (error) {
            alert(error.message);
        }
    });
});
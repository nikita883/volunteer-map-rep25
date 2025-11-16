// Глобальная переменная для карты
let ymapsMap;
let markers = []; // Метки НКО
let cityMarkers = []; // Метки городов

// Список городов присутствия Росатом с координатами
const ROSATOM_CITIES = [
    { name: "Ангарск", coords: [52.5299, 103.9049] },
    { name: "Байкальск", coords: [51.4944, 104.1539] },
    { name: "Балаково", coords: [52.0000, 47.7833] },
    { name: "Билибино", coords: [68.0622, 166.4062] },
    { name: "Волгодонск", coords: [47.5100, 42.2000] },
    { name: "Глазов", coords: [58.1400, 52.6400] },
    { name: "Десногорск", coords: [54.1500, 33.3000] },
    { name: "Димитровград", coords: [54.2500, 49.5000] },
    { name: "Железногорск", coords: [56.2500, 93.4500] },
    { name: "ЗАТО Заречный", coords: [53.1900, 43.7600] },
    { name: "Заречный", coords: [56.8000, 61.3000] },
    { name: "Зеленогорск", coords: [55.9700, 94.6500] },
    { name: "Краснокаменск", coords: [50.0800, 118.0300] },
    { name: "Курчатов", coords: [51.7500, 35.0800] },
    { name: "Лесной", coords: [58.5000, 60.0500] },
    { name: "Неман", coords: [55.1000, 22.0000] },
    { name: "Нововоронеж", coords: [51.2500, 39.2000] },
    { name: "Новоуральск", coords: [57.2500, 60.0800] },
    { name: "Обнинск", coords: [55.0900, 36.6000] },
    { name: "Озерск", coords: [55.7500, 60.7000] },
    { name: "Певек", coords: [69.9500, 170.4000] },
    { name: "Полярные Зори", coords: [67.3700, 32.4800] },
    { name: "Саров", coords: [54.9500, 43.3500] },
    { name: "Северск", coords: [56.0800, 89.6000] },
    { name: "Снежинск", coords: [56.0800, 60.7500] },
    { name: "Советск", coords: [54.5500, 21.8500] },
    { name: "Сосновый Бор", coords: [59.8500, 29.0500] },
    { name: "Трехгорный", coords: [55.8500, 60.6000] },
    { name: "Удомля", coords: [57.8800, 34.1000] },
    { name: "Усолье-Сибирское", coords: [52.7500, 103.6500] },
    { name: "Электросталь", coords: [55.8000, 38.4500] },
    { name: "Энергодар", coords: [47.4800, 34.6500] }
];

// Инициализация карты
function initMap() {
    console.log('initMap вызвана');
    ymaps.ready(() => {
        console.log('YMaps API готов');
        ymapsMap = new ymaps.Map('map', {
            center: [55.7558, 37.6173], // Москва по умолчанию
            zoom: 4, // Уменьшим зум, чтобы увидеть больше городов
            controls: ['zoomControl', 'fullscreenControl']
        });

        // --- Добавляем метки городов ---
        ROSATOM_CITIES.forEach(city => {
            const cityPlacemark = new ymaps.Placemark(
                city.coords,
                {
                    balloonContent: `<b>${city.name}</b><br>Город присутствия Росатом`,
                    // hintContent: city.name // Подсказка при наведении
                },
                {
                    preset: 'islands#redIcon' // Используем другой стиль для городов
                }
            );

            ymapsMap.geoObjects.add(cityPlacemark);
            cityMarkers.push(cityPlacemark); // Сохраняем для потенциальной очистки
        });
        // --- Конец добавления меток городов ---

        // Загрузка начальных НКО
        window.updateMap(); // Убедитесь, что updateMap определена до вызова
    });
}

// Обновление меток НКО на карте
async function updateMap(city = '', category = '', search = '') {
    console.log('updateMap вызвана с параметрами:', { city, category, search });
    if (!ymapsMap) {
        console.error('Карта не инициализирована');
        return;
    }

    // Очистка ТОЛЬКО старых меток НКО, оставляем метки городов
    markers.forEach(marker => ymapsMap.geoObjects.remove(marker));
    markers = [];

    try {
        const npOs = await window.api.getNPOs({ city, category, search });

        npOs.forEach(npo => {
            const placemark = new ymaps.Placemark(
                [npo.latitude, npo.longitude],
                {
                    balloonContent: `<b>${npo.name}</b><br>${npo.description}`
                },
                {
                    preset: 'islands#blueIcon' // Стиль для НКО
                }
            );

            placemark.npoData = npo;

            placemark.events.add('click', function (e) {
                showNPOInfo(npo);
            });

            ymapsMap.geoObjects.add(placemark);
            markers.push(placemark);
        });

        // Установить центр и зум в зависимости от данных НКО
        if (npOs.length > 0) {
            const bounds = ymapsMap.geoObjects.getBounds();
            if (bounds) {
                ymapsMap.setBounds(bounds, { checkZoomRange: true });
            }
        } else {
            // Если НКО нет, можно вернуться к исходному виду или к масштабу, охватывающему все города
            // const allCoords = [...ROSATOM_CITIES.map(c => c.coords), ...npOs.map(n => [n.latitude, n.longitude])];
            // Для простоты, если НКО нет, оставим текущий вид или вернемся к общему обзору
            // ymapsMap.setCenter([55.7558, 37.6173], 4); // Возврат к обзору
        }

    } catch (error) {
        console.error('Ошибка загрузки НКО:', error);
        alert('Ошибка загрузки данных НКО.');
    }
}

// Функция показа информации о НКО (остается без изменений)
function showNPOInfo(npo) {
    document.getElementById('npoName').textContent = npo.name;
    document.getElementById('npoCategory').textContent = `Категория: ${npo.category}`;
    document.getElementById('npoDescription').textContent = npo.description;
    document.getElementById('npoPhone').textContent = npo.phone ? `Телефон: ${npo.phone}` : '';
    document.getElementById('npoAddress').textContent = npo.address ? `Адрес: ${npo.address}` : '';
    document.getElementById('npoWebsite').innerHTML = npo.website_url ? `<a href="${npo.website_url}" target="_blank">Сайт</a>` : '';

    const socialLinksDiv = document.getElementById('npoSocialLinks');
    socialLinksDiv.innerHTML = '';
    if (npo.social_links) {
        try {
            const links = JSON.parse(npo.social_links);
            links.forEach(link => {
                const a = document.createElement('a');
                a.href = link;
                a.textContent = link;
                a.target = "_blank";
                socialLinksDiv.appendChild(document.createElement('br'));
                socialLinksDiv.appendChild(a);
            });
        } catch (e) {
            console.error('Ошибка парсинга соцсетей:', e);
        }
    }

    const logoImg = document.getElementById('npoLogo');
    logoImg.src = npo.logo_path ? `http://localhost:3000${npo.logo_path}` : '';
    logoImg.alt = `Логотип ${npo.name}`;

    document.getElementById('npoInfo').style.display = 'block';
}

// Экспортируем функцию для вызова из main.js
window.updateMap = updateMap;

// Вызов инициализации карты при загрузке скрипта
initMap();
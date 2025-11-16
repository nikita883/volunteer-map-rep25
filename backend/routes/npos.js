const express = require('express');
const multer = require('multer');
const path = require('path');
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Настройка multer для загрузки изображений
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/')); // Создайте папку uploads
    },
    filename: (req, file, cb) => {
        // Генерация уникального имени файла
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Получение списка НКО (только одобренных)
router.get('/', (req, res) => {
    const { city, category, search } = req.query;
    let query = `SELECT id, name, category, description, phone, address, website_url, social_links, logo_path, latitude, longitude FROM np_os WHERE status = 'approved'`;
    const params = [];

    if (city) {
        query += ` AND city = ?`;
        params.push(city);
    }
    if (category) {
        query += ` AND category = ?`;
        params.push(category);
    }
    if (search) {
        query += ` AND (name LIKE ? OR description LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Ошибка при получении НКО:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
        res.json(rows);
    });
});

// Добавление новой НКО (требует авторизации)
router.post('/', authenticateToken, upload.single('logo'), async (req, res) => {
    const { name, category, description, phone, address, website_url, social_links, latitude, longitude, city } = req.body;
    const userId = req.user.id;
    const logoPath = req.file ? `/api/uploads/${req.file.filename}` : null;

    if (!name || !latitude || !longitude || !city) {
        return res.status(400).json({ error: 'Название, координаты и город обязательны' });
    }

    // Сохраняем НКО как "pending" или сразу создаем заявку в очередь модерации
    // Для простоты примера: сразу создаем заявку на добавление
    const nposData = JSON.stringify({
        name, category, description, phone, address, website_url, social_links: JSON.parse(social_links || '[]'),
        logo_path: logoPath, latitude, longitude, city, created_by: userId
    });

    const stmt = db.prepare('INSERT INTO moderation_queue (action, changes_json) VALUES (?, ?)');
    stmt.run(['add', nposData], function(err) {
        if (err) {
            console.error('Ошибка при добавлении заявки в очередь:', err);
            return res.status(500).json({ error: 'Ошибка сервера при отправке на модерацию' });
        }
        res.status(201).json({ message: 'Заявка на добавление НКО отправлена на модерацию' });
    });
    stmt.finalize();
});

// Редактирование НКО (требует авторизации и проверки владельца)
router.put('/:id', authenticateToken, upload.single('logo'), async (req, res) => {
    const { id } = req.params;
    const { name, category, description, phone, address, website_url, social_links, latitude, longitude, city } = req.body;
    const userId = req.user.id;
    const logoPath = req.file ? `/api/uploads/${req.file.filename}` : null;

    // Проверить, что пользователь создал эту НКО (или админ)
    const checkStmt = db.prepare('SELECT created_by FROM np_os WHERE id = ?');
    checkStmt.get([id], (err, row) => {
        if (err) {
            console.error('Ошибка проверки владельца НКО:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
        if (!row) {
            return res.status(404).json({ error: 'НКО не найдена' });
        }
        if (row.created_by !== userId) {
            return res.status(403).json({ error: 'Недостаточно прав для редактирования' });
        }

        const updateData = JSON.stringify({
            name, category, description, phone, address, website_url, social_links: JSON.parse(social_links || '[]'),
            logo_path: logoPath, latitude, longitude, city
        });

        const stmt = db.prepare('INSERT INTO moderation_queue (npos_id, action, changes_json) VALUES (?, ?, ?)');
        stmt.run([id, 'edit', updateData], function(err) {
            if (err) {
                console.error('Ошибка при добавлении заявки на редактирование в очередь:', err);
                return res.status(500).json({ error: 'Ошибка сервера при отправке на модерацию' });
            }
            res.json({ message: 'Заявка на редактирование НКО отправлена на модерацию' });
        });
        stmt.finalize();
    });
    checkStmt.finalize();
});

module.exports = router;
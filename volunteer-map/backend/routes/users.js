const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Пример: получить профиль пользователя
router.get('/profile', authenticateToken, (req, res) => {
    // В реальности тут бы делался запрос в БД
    res.json(req.user);
});

module.exports = router;
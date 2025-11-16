const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Токен отсутствует' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key', (err, user) => {
        if (err) {
            console.error('Ошибка верификации токена:', err);
            return res.status(403).json({ error: 'Недействительный токен' });
        }
        req.user = user;
        next();
    });
};

module.exports = { authenticateToken };
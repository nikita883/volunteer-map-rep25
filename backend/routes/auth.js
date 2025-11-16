const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { db } = require('../database');

const router = express.Router();


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


router.post('/register', async (req, res) => {
    const { email, password, first_name, last_name } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const stmt = db.prepare('INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)');
        stmt.run([email, hashedPassword, first_name, last_name], function(err) {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
                }
                return res.status(500).json({ error: 'Ошибка сервера при регистрации' });
            }
            res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
        });
        stmt.finalize();
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    const stmt = db.prepare('SELECT id, email, password_hash, first_name, last_name FROM users WHERE email = ?');
    stmt.get([email], async (err, row) => {
        if (err) {
            console.error('Ошибка при поиске пользователя:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
        if (!row) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        try {
            const isMatch = await bcrypt.compare(password, row.password_hash);
            if (!isMatch) {
                return res.status(401).json({ error: 'Неверный email или пароль' });
            }

            const token = jwt.sign(
                { id: row.id, email: row.email },
                process.env.JWT_SECRET || 'fallback_secret_key', 
                { expiresIn: '24h' }
            );

            res.json({
                token: token,
                user: { id: row.id, email: row.email, first_name: row.first_name, last_name: row.last_name }
            });
        } catch (error) {
            console.error('Ошибка при сравнении пароля:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    });
    stmt.finalize();
});


router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email обязателен' });
    }

    const stmt = db.prepare('SELECT id FROM users WHERE email = ?');
    stmt.get([email], async (err, row) => {
        if (err) {
            console.error('Ошибка при поиске пользователя для восстановления:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }

        if (row) {
            const resetToken = jwt.sign(
                { id: row.id, email: email },
                process.env.JWT_SECRET || 'fallback_secret_key', 
                { expiresIn: '1h' }
            );

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Восстановление пароля',
                text: `Для сброса пароля перейдите по ссылке: http://localhost:3000/reset-password?token=${resetToken}`
            };

            try {
                await transporter.sendMail(mail懋ptions);
                res.json({ message: 'Ссылка для восстановления отправлена на ваш email' });
            } catch (error) {
                console.error('Ошибка отправки email:', error);
                res.status(500).json({ error: 'Ошибка при отправке email' });
            }
        } else {
            res.json({ message: 'Если email существует, ссылка для восстановления была отправлена' });
        }
    });
    stmt.finalize();
});

module.exports = router;
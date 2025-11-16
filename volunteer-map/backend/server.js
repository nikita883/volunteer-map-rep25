
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const nposRoutes = require('./routes/npos');
const usersRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const { initializeDatabase } = require('./database');

const app = express();

const PORT = process.env.PORT || 3000;


initializeDatabase();


app.use(cors());
app.use(express.json());
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads'))); 


app.use('/api/npos', nposRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/auth', authRoutes);


app.use(express.static(path.join(__dirname, '../frontend')));


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../database.sqlite');
let db = new sqlite3.Database(DB_PATH);

function initializeDatabase() {
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;

    const createNPOsTable = `
        CREATE TABLE IF NOT EXISTS np_os (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            phone TEXT,
            address TEXT,
            website_url TEXT,
            social_links TEXT, -- JSON строка
            logo_path TEXT,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            city TEXT NOT NULL,
            status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users (id)
        );
    `;

    const createModerationQueueTable = `
        CREATE TABLE IF NOT EXISTS moderation_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            npos_id INTEGER,
            action TEXT, -- 'add', 'edit'
            changes_json TEXT, -- JSON строка с изменениями
            status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
            reviewed_by INTEGER,
            reviewed_at DATETIME,
            FOREIGN KEY (npos_id) REFERENCES np_os (id),
            FOREIGN KEY (reviewed_by) REFERENCES users (id)
        );
    `;

    db.serialize(() => {
        db.run(createUsersTable);
        db.run(createNPOsTable);
        db.run(createModerationQueueTable);
        console.log('База данных и таблицы инициализированы.');
    });
}

module.exports = { db, initializeDatabase };
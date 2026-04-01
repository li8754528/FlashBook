const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './database/flashbook.db';
const dbDir = path.dirname(DB_PATH);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT '📝',
    color TEXT DEFAULT '#666666'
  );

  CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    description TEXT,
    category_id INTEGER,
    merchant TEXT,
    location TEXT,
    payment_method TEXT,
    transaction_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id)
  );

  CREATE INDEX IF NOT EXISTS idx_bills_date ON bills(transaction_date);
  CREATE INDEX IF NOT EXISTS idx_bills_category ON bills(category_id);
`);

const defaultCategories = [
  { name: '餐饮', icon: '🍜', color: '#FF6384' },
  { name: '交通', icon: '🚗', color: '#36A2EB' },
  { name: '购物', icon: '🛒', color: '#FFCE56' },
  { name: '娱乐', icon: '🎮', color: '#4BC0C0' },
  { name: '居住', icon: '🏠', color: '#9966FF' },
  { name: '医疗', icon: '💊', color: '#FF9F40' },
  { name: '教育', icon: '📚', color: '#C9CBCF' },
  { name: '其他', icon: '📝', color: '#7C8798' }
];

const insertCategory = db.prepare(
  'INSERT OR IGNORE INTO categories (name, icon, color) VALUES (?, ?, ?)'
);

const insertMany = db.transaction((categories) => {
  for (const cat of categories) {
    insertCategory.run(cat.name, cat.icon, cat.color);
  }
});

insertMany(defaultCategories);

module.exports = db;

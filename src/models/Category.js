const db = require('../config/database');

class Category {
  static findAll() {
    return db.prepare('SELECT * FROM categories ORDER BY name').all();
  }

  static findById(id) {
    return db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  }

  static findByName(name) {
    return db.prepare('SELECT * FROM categories WHERE name = ?').get(name);
  }

  static create(data) {
    const result = db.prepare(
      'INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)'
    ).run(data.name, data.icon || '📝', data.color || '#666666');
    return Category.findById(result.lastInsertRowid);
  }

  static update(id, data) {
    const fields = [];
    const params = [];
    if (data.name !== undefined) { fields.push('name = ?'); params.push(data.name); }
    if (data.icon !== undefined) { fields.push('icon = ?'); params.push(data.icon); }
    if (data.color !== undefined) { fields.push('color = ?'); params.push(data.color); }
    if (fields.length === 0) return Category.findById(id);
    params.push(id);
    db.prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    return Category.findById(id);
  }

  static delete(id) {
    return db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  }
}

module.exports = Category;

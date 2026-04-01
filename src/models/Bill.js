const db = require('../config/database');

class Bill {
  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO bills (amount, description, category_id, merchant, location, payment_method, transaction_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.amount,
      data.description,
      data.category_id,
      data.merchant,
      data.location,
      data.payment_method,
      data.transaction_date
    );
    return Bill.findById(result.lastInsertRowid);
  }

  static findById(id) {
    return db.prepare(`
      SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM bills b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?
    `).get(id);
  }

  static findAll({ page = 1, limit = 20, startDate, endDate, categoryId } = {}) {
    let where = ['1=1'];
    let params = [];

    if (startDate) {
      where.push('b.transaction_date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      where.push('b.transaction_date <= ?');
      params.push(endDate);
    }
    if (categoryId) {
      where.push('b.category_id = ?');
      params.push(categoryId);
    }

    const whereClause = where.join(' AND ');
    const offset = (page - 1) * limit;

    const data = db.prepare(`
      SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM bills b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE ${whereClause}
      ORDER BY b.transaction_date DESC, b.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    const total = db.prepare(`
      SELECT COUNT(*) as count FROM bills b WHERE ${whereClause}
    `).get(...params).count;

    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  static update(id, data) {
    const fields = [];
    const params = [];
    const allowedFields = ['amount', 'description', 'category_id', 'merchant', 'location', 'payment_method', 'transaction_date'];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    if (fields.length === 0) return Bill.findById(id);

    params.push(id);
    db.prepare(`UPDATE bills SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    return Bill.findById(id);
  }

  static delete(id) {
    return db.prepare('DELETE FROM bills WHERE id = ?').run(id);
  }

  static importFromOCR(data) {
    let categoryId = null;
    if (data.category) {
      const cat = db.prepare('SELECT id FROM categories WHERE name = ?').get(data.category);
      if (cat) {
        categoryId = cat.id;
      } else {
        const result = db.prepare('INSERT INTO categories (name) VALUES (?)').run(data.category);
        categoryId = result.lastInsertRowid;
      }
    }

    return Bill.create({
      amount: data.amount,
      description: data.description,
      category_id: categoryId,
      merchant: data.merchant,
      location: data.location,
      payment_method: data.payment_method,
      transaction_date: data.transaction_date
    });
  }
}

module.exports = Bill;

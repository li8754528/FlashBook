const db = require('../config/database');

exports.daily = (req, res) => {
  try {
    const { year, month } = req.query;
    const y = year || new Date().getFullYear();
    const m = month ? String(month).padStart(2, '0') : String(new Date().getMonth() + 1).padStart(2, '0');

    const data = db.prepare(`
      SELECT 
        transaction_date as date,
        SUM(amount) as total,
        COUNT(*) as count
      FROM bills
      WHERE strftime('%Y', transaction_date) = ? AND strftime('%m', transaction_date) = ?
      GROUP BY transaction_date
      ORDER BY transaction_date
    `).all(String(y), m);

    res.json({ success: true, data, period: `${y}-${m}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.monthly = (req, res) => {
  try {
    const { year } = req.query;
    const y = year || new Date().getFullYear();

    const data = db.prepare(`
      SELECT 
        strftime('%m', transaction_date) as month,
        SUM(amount) as total,
        COUNT(*) as count
      FROM bills
      WHERE strftime('%Y', transaction_date) = ?
      GROUP BY strftime('%m', transaction_date)
      ORDER BY month
    `).all(String(y));

    res.json({ success: true, data, year: y });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.yearly = (req, res) => {
  try {
    const data = db.prepare(`
      SELECT 
        strftime('%Y', transaction_date) as year,
        SUM(amount) as total,
        COUNT(*) as count
      FROM bills
      GROUP BY strftime('%Y', transaction_date)
      ORDER BY year
    `).all();

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.byCategory = (req, res) => {
  try {
    const { startDate, endDate } = req.query;
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

    const data = db.prepare(`
      SELECT 
        c.id as category_id,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        SUM(b.amount) as total,
        COUNT(*) as count
      FROM bills b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE ${where.join(' AND ')}
      GROUP BY b.category_id
      ORDER BY total DESC
    `).all(...params);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.overview = (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = today.substring(0, 7);

    const todayTotal = db.prepare(
      'SELECT COALESCE(SUM(amount), 0) as total FROM bills WHERE transaction_date = ?'
    ).get(today).total;

    const monthTotal = db.prepare(
      'SELECT COALESCE(SUM(amount), 0) as total FROM bills WHERE strftime(\'%Y-%m\', transaction_date) = ?'
    ).get(thisMonth).total;

    const totalAmount = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM bills').get().total;

    res.json({
      success: true,
      data: {
        today: todayTotal,
        month: monthTotal,
        totalAmount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

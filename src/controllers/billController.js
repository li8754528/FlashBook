const Bill = require('../models/Bill');

exports.import = (req, res) => {
  try {
    const { amount, description, category, merchant, location, payment_method, transaction_date } = req.body;

    if (!amount || !transaction_date) {
      return res.status(400).json({ success: false, error: 'amount和transaction_date为必填项' });
    }

    const bill = Bill.importFromOCR({
      amount: parseFloat(amount),
      description,
      category,
      merchant,
      location,
      payment_method,
      transaction_date
    });

    res.status(201).json({ success: true, data: bill });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.list = (req, res) => {
  try {
    const { page, limit, startDate, endDate, categoryId } = req.query;
    const result = Bill.findAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      startDate,
      endDate,
      categoryId: categoryId ? parseInt(categoryId) : undefined
    });
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.get = (req, res) => {
  try {
    const bill = Bill.findById(parseInt(req.params.id));
    if (!bill) return res.status(404).json({ success: false, error: '账单不存在' });
    res.json({ success: true, data: bill });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.update = (req, res) => {
  try {
    const bill = Bill.update(parseInt(req.params.id), req.body);
    if (!bill) return res.status(404).json({ success: false, error: '账单不存在' });
    res.json({ success: true, data: bill });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.delete = (req, res) => {
  try {
    Bill.delete(parseInt(req.params.id));
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.clearAll = (req, res) => {
  try {
    const db = require('../config/database');
    db.exec('DELETE FROM bills');
    res.json({ success: true, message: '已清空所有账单数据' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

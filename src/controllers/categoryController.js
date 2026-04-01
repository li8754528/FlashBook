const Category = require('../models/Category');

exports.list = (req, res) => {
  try {
    const categories = Category.findAll();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.get = (req, res) => {
  try {
    const category = Category.findById(parseInt(req.params.id));
    if (!category) return res.status(404).json({ success: false, error: '分类不存在' });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = (req, res) => {
  try {
    const { name, icon, color } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'name为必填项' });
    const category = Category.create({ name, icon, color });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.update = (req, res) => {
  try {
    const category = Category.update(parseInt(req.params.id), req.body);
    if (!category) return res.status(404).json({ success: false, error: '分类不存在' });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.delete = (req, res) => {
  try {
    Category.delete(parseInt(req.params.id));
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

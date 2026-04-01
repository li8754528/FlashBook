const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');

router.post('/import', billController.import);
router.delete('/clear/all', billController.clearAll);
router.get('/', billController.list);
router.get('/:id', billController.get);
router.put('/:id', billController.update);
router.delete('/:id', billController.delete);

module.exports = router;

const router = require('express').Router();
const c = require('../controllers/product.controller');

router.route('/').get(c.getAll).post(c.create);
router.route('/:pid').get(c.getOne).put(c.update).delete(c.remove);

module.exports = router;
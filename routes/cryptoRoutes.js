const express = require('express');
const router = express.Router();
const cryptoController = require('../controllers/cryptoController');

router.get('/trending', cryptoController.getTrendingPairs);
router.post('/pairs', cryptoController.createPair);

module.exports = router;
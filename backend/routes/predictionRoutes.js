
const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');

router.get('/symptoms', predictionController.getSymptoms);
router.post('/', predictionController.predictDisease);

module.exports = router;

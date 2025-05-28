const express = require('express');
const router = express.Router();
const { checkinFamily } = require('../controllers/checkinController');

router.post('/', checkinFamily);

module.exports = router;
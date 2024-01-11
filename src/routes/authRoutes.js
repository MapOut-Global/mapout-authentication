const express = require('express');
const { request, complete } = require('../controllers/otp_login/login');

const router = express.Router();

router.post('/otp/start', request);
router.post('/otp/candidate/complete', complete);

module.exports = router;

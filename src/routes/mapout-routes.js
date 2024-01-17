const express = require('express');
const { request, complete } = require('../controllers/mapout-controllers/otp_login');

const router = express.Router();

router.post('/auth/otp/start', request);
router.post('/auth/otp/candidate/complete', complete);

module.exports = router;

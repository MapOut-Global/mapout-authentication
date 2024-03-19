const express = require('express');
const { request, complete } = require('../controllers/mapout-controllers/otp_login');
const { signup, signin } = require('../controllers/mapout-controllers/email-auth/index');

const router = express.Router();

router.post('/auth/otp/start', request);
router.post('/auth/otp/candidate/complete', complete);

router.post('/auth/signup/email', signup );
router.post('/auth/signin/email', signin );

module.exports = router;

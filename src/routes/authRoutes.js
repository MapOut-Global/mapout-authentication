const express = require('express');
const { request, complete } = require('../controllers/otp_login/index');
const { googleAuth } = require('../controllers/social_login/Google2_Oauth');
const { appleAuth } = require('../controllers/social_login/apple_oauth');

const router = express.Router();

router.post('/otp/start', request);
router.post('/otp/candidate/complete', complete);
router.post('/google',googleAuth );
router.post('/apple', appleAuth);

module.exports = router;

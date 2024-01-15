const express = require('express');
const { request, complete } = require('../controllers/mapout-controllers/otp_login/index');
const { googleAuth } = require('../controllers/mapout-controllers/social_login/Google2_Oauth');
const { appleAuth } = require('../controllers/mapout-controllers/social_login/apple_oauth');

const router = express.Router();

router.post('/auth/otp/start', request);
router.post('/auth/otp/candidate/complete', complete);
router.post('/auth/google',googleAuth );
router.post('/auth/apple', appleAuth);

module.exports = router;

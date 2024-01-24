const express = require('express');
const { googleAuth } = require('../controllers/social_login/Google2_Oauth');
const { appleAuth } = require('../controllers/social_login/Apple_Oauth');
const linkedin_Oauth = require('../controllers/social_login/linkedin_Oauth');

const router = express.Router();

router.post('/auth/google', googleAuth );
router.post('/auth/apple', appleAuth);
router.post('/auth/linkedin',linkedin_Oauth)

module.exports = router;
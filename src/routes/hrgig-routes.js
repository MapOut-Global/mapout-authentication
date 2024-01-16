const express = require('express');
const { signup, login } = require('../controllers/hrgig-controllers/authentication-service/auth');
const { googleAuth } = require('../controllers/mapout-controllers/social_login/Google2_Oauth');

const router = express.Router();

router.post('/auth/signup', signup);
router.post('/auth/login', login);
router.post('/auth/google', googleAuth );


module.exports = router;
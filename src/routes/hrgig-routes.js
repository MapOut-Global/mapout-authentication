const express = require('express');
const { signup } = require('../controllers/hrgig-controllers/authentication-service/index');

const router = express.Router();

router.post('/auth/signup', signup);


module.exports = router;
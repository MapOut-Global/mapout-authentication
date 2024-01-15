const express = require('express');
const { signup } = require('../controllers/hrgig-controllers');

const router = express.Router();

router.post('/auth/signup', signup);


module.exports = router;
const express = require('express');
const { request, complete } = require('../controllers/mapout-controllers/otp_login');
const { signup, signin } = require('../controllers/mapout-controllers/email-auth/index');
const { acc_deactivate} = require('../controllers/mapout-controllers/AccManage/deactivate');
const { acc_delete } = require('../controllers/mapout-controllers/AccManage/delete');

const router = express.Router();

router.post('/auth/otp/start', request);
router.post('/auth/otp/candidate/complete', complete);

router.post('/auth/employer/signup', signup );
router.post('/auth/employer/signin', signin );

/**Acc Management */
router.put("/auth/acc_manage/deactivate/:userId", acc_deactivate);
router.post('/auth/acc_manage/otp/send', request);
router.delete("/auth/acc_manage/delete/:userId", acc_delete);

module.exports = router;

const express = require("express")
const router = express.Router();
const mapoutRoutes = require('./mapout-routes');
const hrgigRoutes = require('./hrgig-routes');
const socialLoginRoutes = require('./social-login.routes');

router.get('/mapout-authentication', (req, res) => res.send("Mapout - Authentication"))

router.use('/mapout-authentication/mapout', mapoutRoutes);
router.use('/mapout-authentication/hrgig', hrgigRoutes);
router.use('/mapout-authentication/social-login', socialLoginRoutes)

module.exports = router
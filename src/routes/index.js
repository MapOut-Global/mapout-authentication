const express = require("express")
const router = express.Router();
const mapoutRoutes = require('./mapout-routes');
const hrgigRoutes = require('./hrgig-routes');
const socialLoginRoutes = require('./social-login.routes');
const {authMiddleware} = require("../middlewares/authMiddlware");

router.get('/mapout-authentication', (req, res) => res.send("Mapout - Authentication"))

router.use('/mapout-authentication/mapout', mapoutRoutes);
router.use('/mapout-authentication/hrgig', hrgigRoutes);
router.use('/mapout-authentication/social-login', socialLoginRoutes)

router.use('/mapout-authentication', authMiddleware, (req, res, next) => {
    if (req.redirectToMapout) {
        return mapoutRoutes(req, res, next);
    } else if (req.redirectToHrgig) {
        return hrgigRoutes(req, res, next);
    } else {
        return next();
    }
});

module.exports = router;

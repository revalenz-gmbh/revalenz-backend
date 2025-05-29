const express = require('express');

// Einzelne Auth-Router importieren
const registerRoutes = require('./register');
const loginRoutes = require('./login');
const verifyRoutes = require('./verify');
const requestResetRoutes = require('./request-reset');
const resetRoutes = require('./reset');
const resendVerificationRoutes = require('./resend-verification');

// Haupt-Router für alle Auth-Funktionen
const router = express.Router();

// Alle Auth-Routen unter /auth bündeln
router.use(registerRoutes);
router.use(loginRoutes);
router.use(verifyRoutes);
router.use(requestResetRoutes);
router.use(resetRoutes);
router.use(resendVerificationRoutes);

// Exportiere den gebündelten Auth-Router
module.exports = router;
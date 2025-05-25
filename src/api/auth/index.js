const express = require('express');
const registerUser = require('./register');
const loginUser = require('./login');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
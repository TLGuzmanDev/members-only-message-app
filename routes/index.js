const express = require('express');
const router = express.Router();
const indexController = require('../controllers/index');

router.get('/', indexController.index);

router.get('/signup', indexController.signup_get);

router.post('/signup', indexController.signup_post);

router.get('/login', indexController.login_get);

module.exports = router;

const express = require('express');
const passport = require('passport');
const router = express.Router({mergeParams: true});
const  catchAsync = require('../utilities/catchAsync');
const users = require('../Controllers/users');

router.route('/register')
    .get(users.renderRegisterForm)
    .post(catchAsync(users.registerUser));

router.route('/login')
    .get(users.renderLoginForm)
    .post(passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), users.loginUser);

router.get('/logout', users.logoutUser)

module.exports = router;
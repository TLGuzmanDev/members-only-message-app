const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');

const index = (req, res, next) => {
  res.render('index', {
    title: 'Welcome',
  });
};

const signup_get = (req, res, next) => {
  res.render('signup_form', {
    title: 'Sign Up',
  });
};

const signup_post = [
  // validate and sanitze form data
  body('firstname', 'Invalid first name').trim().isAlpha(),
  body('lastname', 'Invalid last name').trim().isAlpha(),
  body('username', 'Invalid username').trim().isAlphanumeric(),
  body('password', 'Invalid password').trim().isLength({ min: 6 }),
  body('*').escape(),
  async (req, res, next) => {
    // get validation errors from req
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // request contained errors
      // render form again including form data and errors
      return res.render('signup_form', {
        title: 'Sign Up',
        user: req.body,
        errors: errors.array(),
      });
    } else {
      try {
        // create user with form data and hashed password
        const hash = await bcrypt.hash(req.body.password, 10);
        const user = new User({
          first_name: req.body.firstname,
          last_name: req.body.lastname,
          username: req.body.username,
          password: hash,
          membership_status: true,
        });

        await user.save();
        return res.redirect('/');
      } catch (error) {
        return next(error);
      }
    }
  },
];

const login_get = (req, res, next) => {
  res.render('login_form', {
    title: 'Login',
  });
};

module.exports = {
  index,
  signup_get,
  signup_post,
  login_get,
};

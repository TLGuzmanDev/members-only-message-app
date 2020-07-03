const bcrypt = require('bcryptjs');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');

// Display homepage
const index = (req, res, next) => {
  res.render('index', {
    title: 'Welcome',
    user: req.user,
  });
};

// Display User create form on GET
const signup_get = (req, res, next) => {
  res.render('signup_form', {
    title: 'Sign Up',
  });
};

// Handle User create form on POST
const signup_post = [
  // Validate and sanitize form data
  body('firstname', 'Invalid first name').trim().isAlpha(),
  body('lastname', 'Invalid last name').trim().isAlpha(),
  body('username', 'Invalid username').trim().isAlphanumeric(),
  body('password', 'Invalid password').trim().isLength({ min: 6 }),
  body('*').escape(),

  // Process request after validation and sanitization
  async (req, res, next) => {
    // Extract validation errors from request
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Request contained errors
      // Render form with sanitized values and errors
      return res.render('signup_form', {
        title: 'Sign Up',
        user: req.body,
        errors: errors.array(),
      });
    } else {
      try {
        // Request Data is valid
        // Create user object with form data and hashed password
        const hash = await bcrypt.hash(req.body.password, 10);
        const user = new User({
          first_name: req.body.firstname,
          last_name: req.body.lastname,
          username: req.body.username,
          password: hash,
          membership_status: true,
        });

        // Check if username already exist
        const found_user = await User.findOne({
          username: user.username,
        }).exec();

        if (found_user) {
          // Username exist
          // Render form with sanitized values and errors
          return res.render('signup_form', {
            title: 'Sign Up',
            user: req.body,
            errors: [
              {
                param: 'username',
                msg: 'Username already in use.',
              },
            ],
          });
        } else {
          // Save user and redirect to index page
          await user.save();
          return res.redirect('/');
        }
      } catch (error) {
        return next(error);
      }
    }
  },
];

// Display login form on GET
const login_get = (req, res, next) => {
  res.render('login_form', {
    title: 'Login',
  });
};

const login_post = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
});

const logout = (req, res, next) => {
  req.logout();
  res.redirect('/');
};

module.exports = {
  index,
  signup_get,
  signup_post,
  login_get,
  login_post,
  logout,
};

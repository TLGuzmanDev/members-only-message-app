const bcrypt = require('bcryptjs');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const Message = require('../models/message');

// Display homepage
const index = (req, res, next) => {
  Message.find()
    .populate('user')
    .exec((err, messages) => {
      if (err) {
        return next(err);
      }
      res.render('index', {
        title: 'Members Only',
        user: req.user,
        messages,
      });
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
  body('confirmpassword')
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      // success of custom validator
      return true;
    }),

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

const message_create_get = (req, res, next) => {
  res.render('message_form', {
    title: 'Create Message',
    user: req.user,
  });
};

// Handle message create on POST
const message_create_post = [
  // Validate and sanitize form data
  body('title', 'Invalid title').trim().isLength({ min: 1 }),
  body('message', 'Invalid message').trim().isLength({ min: 1 }),
  body('*').escape(),

  // Process request after validation and sanitization
  (req, res, next) => {
    // check if user is logged in
    if (!req.user) {
      res.redirect('/login');
    }
    // Extract validation errors from request
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Request contained errors
      // Render form with sanitized values and errors
      return res.render('message_form', {
        title: 'Create Message',
        user: req.user,
        message: req.body,
        errors: errors.array(),
      });
    } else {
      // Request Data is valid
      // Create message object with form data and hashed password
      const message = new Message({
        user: req.user.id,
        title: req.body.title,
        text: req.body.message,
      });
      // Save user and redirect to index page
      message.save((err) => {
        if (err) {
          return next(err);
        }
        return res.redirect('/');
      });
    }
  },
];

module.exports = {
  index,
  signup_get,
  signup_post,
  login_get,
  login_post,
  logout,
  message_create_get,
  message_create_post,
};

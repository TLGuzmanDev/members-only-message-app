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

const login_get = (req, res, next) => {
  res.render('login_form', {
    title: 'Login',
  });
};

module.exports = {
  index,
  signup_get,
  login_get,
};

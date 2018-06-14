const routes = require('./routes');
const verify = require('./routes/verify/');

const cookieParser = require('cookie-parser');
const { authenticate } = require('@feathersjs/authentication').express;

// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.get('/logout', (req, res) => {
    res.clearCookie('feathers-jwt');
    res.redirect('/login');
  });

  app.get('/signup', cookieParser(), (req, res, next) => {
    if (req.cookies['feathers-jwt'] || req.user) {
      return res.redirect('/');
    }
    else {
      return res.render('signup');
    }
  });

  app.post('/signup', (req, res, next) => {
    const users = app.service('s/users');
    users.create(req.body.user).then((user) => {
      return res.json({code: 201});
    }).catch((error) => {
      return res.json(error);
    });
  });

  app.get('/login', cookieParser(), (req, res, next) => {
    if (req.cookies['feathers-jwt'] || req.user) {
      return res.redirect('/');
    }
    else {
      return res.render('login');
    }
  });

  app.use('/verify', verify);

  app.all('*', cookieParser(), authenticate('jwt'), (req, res, next) => {
    if (req.authenticated && req.user) {
      req.user.isTeacher = req.user.role == 'TEACHER';
      return next();
    }
    else {
      return res.render('login');
    }
  });

  app.configure(routes);
};

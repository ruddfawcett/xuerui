// Initializes the `/mailer` service on path `/mailer`
const hooks = require('./mailer.hooks');
const Mailer = require('feathers-mailer');
const smtpTransport = require('nodemailer-smtp-transport');

module.exports = function (app) {
  app.use('/mailer', Mailer(smtpTransport({
    service: 'gmail',
    secure: true,
    auth: {
      user: app.get('GMAIL'),
      pass: app.get('GMAIL_PASSWORD')
    }
  })));

  const service = app.service('mailer');

  service.hooks(hooks);
};

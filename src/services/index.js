const users = require('./users/users.service.js');
const mailer = require('./mailer/mailer.service.js');
const authmanagement = require('./authmanagement/authmanagement.service.js');
const assignments = require('./assignments/assignments.service.js');
const courses = require('./courses/courses.service.js');
const words = require('./words/words.service.js');
const progress = require('./progress/progress.service.js');

// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(mailer);
  app.configure(authmanagement);
  app.configure(assignments);
  app.configure(courses);
  app.configure(words);
  app.configure(progress);
};

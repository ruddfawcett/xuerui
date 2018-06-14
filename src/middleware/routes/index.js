const courses = require('./courses/');
const join = require('./join/');

module.exports = function (app) {
  app.get('/', (req, res, next) => {
    const courses = req.app.service('s/courses');

    var query;
    if (req.user.isTeacher) {
      query = { admin: req.user._id }
    }
    else {
      query = { roster: req.user._id }
    }

    courses.find({ query: query}).then((data) => {

      return res.render('home', {
        user: req.user,
        courses: data
      });
    });
  });

  app.use('/course', courses);
  app.use('/join', join);
};

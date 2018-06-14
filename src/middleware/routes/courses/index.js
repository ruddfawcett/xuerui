const router = require('@feathersjs/express').Router();
const async = require('async');

router.post('/new', (req, res, next) => {
  if (req.user.isTeacher) {
    const courses = req.app.service('s/courses');
    return courses.create({
      name: req.body.name,
      description: req.body.description,
      admin: req.user._id
    }).then((course) => {
      return res.json({code: 201, id: course.shortId});
    }).catch((error) => {
      return res.json(error);
    });
  }
});

router.get('/:id', (req, res, next) => {
  const courses = req.app.service('s/courses');

  return courses.find({ query: { shortId: req.params.id}}).then((data) => {
    if (data.length == 0) {
      return next();
    }

    let course = data[0];
    return res.render('course-overview', {
      user: req.user,
      course: course
    });
  });
});

router.get('/:id/:assignmentId', (req, res, next) => {
  const assignments = req.app.service('s/assignments');
  const courses = req.app.service('s/courses');
  const progress = req.app.service('s/progress');
  const users = req.app.service('s/users');

  return assignments.find({ query: { shortId: req.params.assignmentId}}).then((assignment) => {
    if (assignment.length) {
      if (req.user.isTeacher) {
        return courses.find({ query: { assignments: assignment[0]._id, admin: req.user._id } }).then((data) => {
          var roster_progress = [];

          return async.each(data[0].roster, function(student, next) {
            return progress.find({ query: { user: student, assignment: assignment[0]._id } }).then((the_progress) => {
              return users.find({ query: { _id: student } }).then((the_users) => {
                if (the_progress.length) {
                  roster_progress.push({
                    student: the_users[0],
                    progress: the_progress[0]
                  });
                }
                else {
                  roster_progress.push({
                    student: the_users[0],
                    progress: {}
                  });
                }
                next();
              })
            });
          }, function(err) {
            console.log({
              assignment: assignment[0],
              roster: roster_progress,
              user: req.user
            });
            return res.render('progress', {
              assignment: assignment[0],
              roster: roster_progress,
              user: req.user
            });
          });
        }).catch((error) => {
          return next(error);
        });
      }
      else {
        return courses.find({ query: { assignments: assignment[0]._id, roster: req.user._id } }).then((data) => {
          return res.render('learning-in-context', {
            assignment: assignment[0],
            words: JSON.stringify(assignment[0].words),
            user: req.user
          });
        });
      }
    }
    else {
      return next();
    }
  }).catch((error) => {
    return next(error);
  });
});

router.get('/:id/:assignmentId/progress', (req, res, next) => {
  const assignments = req.app.service('s/assignments');
  const courses = req.app.service('s/courses');
  const progress = req.app.service('s/progress');

  return assignments.find({ query: { shortId: req.params.assignmentId}}).then((assignment) => {
    if (assignment.length) {
      return courses.find({ query: { assignments: assignment[0]._id, roster: req.user._id } }).then((data) => {
        return progress.find({ query: { user: req.user._id, assignment: assignment[0]._id } }).then((the_progress) => {
          return res.json(the_progress.length ? the_progress[0] : {});
        });
      }).catch((error) => {
        return next(error);
      });
    }
    else {
      return next();
    }
  }).catch((error) => {
    return next(error);
  });
});

router.post('/:id/:assignmentId/progress', (req, res, next) => {
  const assignments = req.app.service('s/assignments');
  const courses = req.app.service('s/courses');
  const progress = req.app.service('s/progress');

  return assignments.find({ query: { shortId: req.params.assignmentId}}).then((assignment) => {
    if (assignment.length) {
      return courses.find({ query: { assignments: assignment[0]._id, roster: req.user._id } }).then((data) => {
        return progress.find({ query: { user: req.user._id, assignment: assignment[0]._id } }).then((the_progress) => {
          if (the_progress.length) {
            return progress.patch(the_progress[0]._id, { $push: { rounds: req.body } }).then((the_update) => {
              return res.json(the_update);
            });
          }
          else {
            return progress.create({
              user: req.user._id,
              assignment: assignment[0]._id,
              rounds: [
                req.body
              ]
            }).then((data) => {
              return res.json(data);
            });
          }
        });
      }).catch((error) => {
        return next(error);
      });
    }
    else {
      return next();
    }
  }).catch((error) => {
    return next(error);
  });
});

router.get('/:id/create-assignment', (req, res, next) => {
  return res.render('assignment-editor');
});

router.post('/:id/create-assignment', (req, res, next) => {
  const courses = req.app.service('s/courses');
  const words = req.app.service('s/words');
  const assignments = req.app.service('s/assignments');

  return courses.find({ query: { shortId: req.params.id, admin: req.user._id }}).then((data) => {
    if (data.length != 0) {
      let payload = req.body;
      var ws = [];

      return async.each(payload.words, function(word, next) {
        words.create(word).then((wdata) => {
          ws.push(wdata._id);
          next();
        });
      }, function(err) {
        return assignments.create({
          name: payload.name,
          text: payload.text,
          words: ws
        }).then((assignment) => {
          return courses.patch(data[0]._id, { $push: { assignments: assignment._id } }).then(() => {
            return res.json(assignment);
          });
        });
      });
    }
  });
});

module.exports = router;

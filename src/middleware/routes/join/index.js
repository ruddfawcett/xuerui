const router = require('@feathersjs/express').Router();

router.get('/:id', (req, res, next) => {
  const courses = req.app.service('s/courses');

  if (!req.user.isTeacher) {
    return courses.find({
      query: {
        shortId: req.params.id,
        roster: {
          $ne: req.user._id
        }
      }
    }).then((data) => {
      if (data.length == 1) {
        data = data[0];
      }
      else {
        return res.redirect('/');
      }

      return courses.patch(data._id, { $push: { roster: req.user._id } }).then((data) => {
        return res.redirect('/');
      }).catch((error) => {
        return next(error);
      });
    }).catch((error) => {
      return next(error);
    });
  }
});

module.exports = router;

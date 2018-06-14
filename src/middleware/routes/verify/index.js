const router = require('@feathersjs/express').Router();

router.get('/:token', (req, res, next) => {
  const authmanagement = req.app.service('/authManagement');

  authmanagement.create({
    action: 'verifySignupLong',
    value: req.params.token
  }).then((data) => {
    return res.redirect('/login');
  }).catch((error) => {
    return res.json(error);
  });

});

module.exports = router;

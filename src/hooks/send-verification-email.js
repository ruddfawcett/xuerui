const accountService = require('../services/authmanagement/notifier');

module.exports = (options = {}) => hook => {
  const user = hook.result;

  if (hook.app.get('GMAIL') && hook.data && hook.data.email && user) {
    accountService(hook.app).notifier('resendVerifySignup', user);
    return hook;
  }

  return hook;
}

const _ = require('lodash');

const { authenticate } = require('@feathersjs/authentication').hooks;
const { restrictToOwner } = require('feathers-authentication-hooks');
const verifyHooks = require('feathers-authentication-management').hooks;
const accountService = require('../authmanagement/notifier');
const commonHooks = require('feathers-hooks-common');

const {
  hashPassword, protect
} = require('@feathersjs/authentication-local').hooks;

const {
  isEnabled,
  setDefaultRole,
  sendVerificationEmail,
  hasPermissionsBoolean,
  preventDisabledAdmin,
  loopItems,
} = require('../../hooks');

const restrict = [
  authenticate('jwt'),
  isEnabled(),
  restrictToOwner({
    idField: '_id',
    ownerField: '_id'
  })
];

module.exports = {
  before: {
    all: [],
    find: [
      authenticate('jwt'),
      isEnabled(),
    ],
    get: [
      authenticate('jwt'),
      isEnabled(),
    ],
    create: [
      hashPassword(),
      verifyHooks.addVerification()
    ],
    update: [
      commonHooks.disallow('external')
    ],
    patch: [
      ...restrict,
      commonHooks.iff(commonHooks.isProvider('external'), commonHooks.preventChanges(true,
        'email',
        'isVerified',
        'verifyToken',
        'verifyShortToken',
        'verifyExpires',
        'verifyChanges',
        'resetToken',
        'resetShortToken',
        'resetExpires'
      ))
    ],
    remove: [
      ...restrict
    ]
  },

  after: {
    all: [
      protect('password'),
      commonHooks.when(
        hook => hook.params.provider,
        commonHooks.discard('password', '_computed', 'verifyExpires', 'resetExpires', 'verifyChanges')
      )
    ],
    find: [],
    get: [],
    create: [
      sendVerificationEmail(),
      verifyHooks.removeVerification()
    ],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};

const { authenticate } = require('@feathersjs/authentication').hooks;
const { populate, disallow, iff } = require('feathers-hooks-common');

const moment = require('moment');

const wordSchema = {
  include: {
    service: 's/words',
    nameAs: 'words',
    parentField: 'words',
    childField: '_id'
  }
};


let changeDate = (context) => {
  context.result.forEach((result) => {
    result.createdAt = moment(result.createdAt).format('MMM D, YYYY');
    result.updatedAt = moment(result.updatedAt).format('MMM D, YYYY');
  });
}

module.exports = {
  before: {
    all: [ disallow('external'), authenticate('jwt') ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [ populate({ schema:  wordSchema}) ],
    find: [ changeDate ],
    get: [],
    create: [],
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

const { authenticate } = require('@feathersjs/authentication').hooks;
const { populate } = require('feathers-hooks-common');

const assignmentSchema = {
  include: {
    service: 's/assignments',
    nameAs: 'full_assignments',
    parentField: 'assignments',
    childField: '_id'
  }
};

const rosterSchema = {
  include: {
    service: 's/users',
    nameAs: 'full_roster',
    parentField: 'roster',
    childField: '_id'
  }
};

const moment = require('moment');

let changeDate = (context) => {
  context.result.forEach((result) => {
    result.createdAt = moment(result.createdAt).format('MMM D, YYYY');
    result.updatedAt = moment(result.updatedAt).format('MMM D, YYYY');
  });
}

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [ populate({ schema:  assignmentSchema}), populate({ schema:  rosterSchema }) ],
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

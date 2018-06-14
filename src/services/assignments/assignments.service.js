// Initializes the `assignments` service on path `/assignments`
const createService = require('feathers-mongoose');
const createModel = require('../../models/assignments.model');
const hooks = require('./assignments.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'assignments',
    Model,
    // paginate
  };

  // Initialize our service with any options it requires
  app.use('/s/assignments', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('s/assignments');

  service.hooks(hooks);
};

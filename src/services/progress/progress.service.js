// Initializes the `progress` service on path `/progress`
const createService = require('feathers-mongoose');
const createModel = require('../../models/progress.model');
const hooks = require('./progress.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'progress',
    Model,
    // paginate
  };

  // Initialize our service with any options it requires
  app.use('/s/progress', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('s/progress');

  service.hooks(hooks);
};

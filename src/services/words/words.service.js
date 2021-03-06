// Initializes the `words` service on path `/words`
const createService = require('feathers-mongoose');
const createModel = require('../../models/words.model');
const hooks = require('./words.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'words',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/s/words', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('s/words');

  service.hooks(hooks);
};

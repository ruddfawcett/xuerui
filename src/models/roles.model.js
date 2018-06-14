var shortId = require('shortid');

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const roles = new Schema({
    shortId: { type: String, unique: true, default: shortId.generate },
    text: { type: String, required: true }
  }, {
    timestamps: true
  });

  return mongooseClient.model('roles', roles);
};

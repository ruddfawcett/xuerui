var shortId = require('shortid');

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const assignments = new Schema({
    shortId: { type: String, unique: true, default: shortId.generate },
    creator: { type: Schema.Types.ObjectId, ref: 'User' },

    name: { type: String, required: true },
    text: { type: String, required: true },

    words: [{ type: Schema.Types.ObjectId, ref: 'Word' }]
  }, {
    timestamps: true
  });

  return mongooseClient.model('assignments', assignments);
};

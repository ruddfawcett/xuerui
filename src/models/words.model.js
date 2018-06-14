var shortId = require('shortid');

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const words = new Schema({
    shortId: { type: String, unique: true, default: shortId.generate },

    part_of_speech: { type: String, required: false },
    zh: { type: String, required: true },
    py: { type: String, required: true },
    en: { type: String, required: true }
  }, {
    timestamps: true
  });

  return mongooseClient.model('words', words);
};

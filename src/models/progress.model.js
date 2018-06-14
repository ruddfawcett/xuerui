var shortId = require('shortid');

// progress-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const progress = new Schema({
    shortId: { type: String, unique: true, default: shortId.generate },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    assignment: { type: Schema.Types.ObjectId, ref: 'Assignment' },
    rounds: [
      {
        round: { type: Number, required: true },
        progress: { type: Number },
        completed_at: { type: Date, default: Date.now },
        next_at: { type: Date },
        correct: [{ type: Schema.Types.ObjectId, ref: 'Word' }],
        incorrect: [{ type: Schema.Types.ObjectId, ref: 'Word' }]
      }
    ]
  }, {
    timestamps: true
  });

  return mongooseClient.model('progress', progress);
};

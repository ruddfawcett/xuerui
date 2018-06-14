var shortId = require('shortid');

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const courses = new Schema({
    shortId: { type: String, unique: true, default: shortId.generate },

    name: { type: String, required: true },
    description: { type: String, required: false },
    admin: { type: Schema.Types.ObjectId, ref: 'User' },

    assignments: [{ type: Schema.Types.ObjectId, ref: 'Assignment' }],
    roster: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  }, {
    timestamps: true
  });

  return mongooseClient.model('courses', courses);
};

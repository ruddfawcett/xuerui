var shortId = require('shortid');

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const users = new mongooseClient.Schema({
    shortId: { type: String, unique: true, default: shortId.generate },

    name: {
      first: { type: String, required: true },
      last: { type: String, required: true }
    },
    email: {type: String, unique: true},
    password: { type: String },
    role: { type: String, enum: ['TEACHER', 'STUDENT'], default: 'TEACHER' },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

    isVerified: { type: Boolean },
    verifyToken: { type: String },
    verifyExpires: { type: Date },
    verifyChanges: { type: Object },
    resetToken: { type: String },
    resetExpires: { type: Date }

  }, {
    timestamps: true
  });

  return mongooseClient.model('users', users);
};

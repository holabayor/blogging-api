const { mongoose } = require('../config/db');

const UserSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      // hook to remove password field from the JSON object sent in response
      transform: function (doc, user) {
        delete user.password;
        delete user.__v;
        return user;
      },
    },
  }
);

module.exports = mongoose.model('User', UserSchema);

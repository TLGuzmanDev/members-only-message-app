const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    first_name: {
      type: String,
      required: true,
      lowercase: true,
    },
    last_name: {
      type: String,
      required: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    membership_status: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

UserSchema.virtual('name').get(function () {
  return `${this.first_name} ${this.last_name}`;
});

module.exports = mongoose.model('User', UserSchema);

const { Schema, model } = require('mongoose');

const { formatLink } = require('../utils/files-paths');
const { env, constants } = require('../config/constants');

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minLength: 5,
      maxLength: 50,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: constants.EMAIL_REGEX,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      trim: true,
      default: constants.DEFAULT_USER_IMAGE,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isEmailConfirmed: {
      type: Boolean,
      default: false,
    },
    isGroupsPrivate: {
      type: Boolean,
      default: false,
    },
    groups: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Group',
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { toObject: { virtuals: true }, toJSON: { virtuals: true }, versionKey: false }
);

userSchema.virtual('id').get(function () {
  return this._id.toString();
});

// userSchema.virtual('imagePath').get(function () {
//   return formatPath('public', 'profiles-images', this.image);
// });

userSchema.virtual('imageUrl').get(function () {
  return formatLink(env.BACKEND_URL, 'profiles-images', this.image);
});

module.exports = model('User', userSchema);

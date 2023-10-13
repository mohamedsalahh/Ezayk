const { Schema, model } = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const mongooseLeanId = require('mongoose-lean-id');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const bcrypt = require('bcryptjs');

const { formatLink } = require('../utils/files-paths');
const { env } = require('../config/constants');

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxLength: 30,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    bio: {
      type: String,
    },
    password: {
      type: String,
      required: true,
      select: false,
      minLength: 4,
    },
    isEmailConfirmed: {
      type: Boolean,
      default: false,
    },
    isGroupsPrivate: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
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
  { toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

userSchema.virtual('imageUrl').get(function () {
  return formatLink(env.BACKEND_URL, 'profiles-images', this._id + '.png');
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (err) {
    next(err);
  }
});

userSchema.plugin(mongooseLeanVirtuals);
userSchema.plugin(mongooseLeanId);
userSchema.plugin(uniqueValidator, {
  message: 'There is already a user with that {PATH}',
});

module.exports = model('User', userSchema);

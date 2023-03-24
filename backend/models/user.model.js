const { Schema, model } = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const mongooseLeanId = require('mongoose-lean-id');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const bcrypt = require('bcryptjs');

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
      maxLength: 25,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isEmailConfirmed: {
      type: Boolean,
      default: false,
      // select: false,
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
  { toObject: { virtuals: true }, toJSON: { virtuals: true }, versionKey: false }
);

userSchema.virtual('imageUrl').get(function () {
  return formatLink(env.BACKEND_URL, 'profiles-images', this.id + '.png');
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

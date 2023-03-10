const { Schema, model } = require('mongoose');

const { formatLink } = require('../utils/files-paths');
const { env, constants } = require('../config/constants');

const groupMembersLimit = (array) => {
  return array.length <= constants.GROUP_MAX_USER_NUMBER;
};

const groupSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
      default: constants.DEFAULT_GROUP_IMAGE,
    },
    members: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      validate: [groupMembersLimit, 'The group exceeds the limit of 100 members'],
    },
    admins: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
    joinLinkToken: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { toObject: { virtuals: true }, toJSON: { virtuals: true }, versionKey: false }
);

groupSchema.virtual('id').get(function () {
  return this._id.toString();
});

// groupSchema.virtual('imagePath').get(function () {
//   return formatPath('public', 'groups-images', this.image);
// });

groupSchema.virtual('imageUrl').get(function () {
  return formatLink(env.BACKEND_URL, 'groups-images', this.image);
});

module.exports = model('Group', groupSchema);

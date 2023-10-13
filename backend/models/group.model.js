const { Schema, model } = require('mongoose');
const mongooseLeanId = require('mongoose-lean-id');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

const { formatLink } = require('../utils/files-paths');
const { env, constants } = require('../config/constants');

const groupMembersLimit = (array) => {
  return array.length <= constants.GROUP_MAX_MEMBERS_NUMBER;
};

const groupSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
      unique: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

groupSchema.virtual('imageUrl').get(function () {
  return formatLink(env.BACKEND_URL, 'groups-images', this._id + '.png');
});

groupSchema.plugin(mongooseLeanVirtuals);
groupSchema.plugin(mongooseLeanId);

module.exports = model('Group', groupSchema);

const sgMail = require('@sendgrid/mail');

const { env } = require('./constants');

sgMail.setApiKey(env.SENDGRID_API_KEY);

module.exports = {
  sgMail,
  templates: {
    CONFIRMATION_EMAIL: 'd-873ed52c574941b884bcba8d9bc65738',
  },
};

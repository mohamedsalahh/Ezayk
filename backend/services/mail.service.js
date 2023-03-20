const { env } = require('../config/constants');
const { sgMail } = require('../config/sendgrid');

/**
 * Sends an email to the specified recipient(s) using the specified template.
 * @async
 * @param {string[] | string} to - The email address(es) of the recipient(s).
 * @param {string} templateId - The ID of the email template to use.
 * @param {object} data - The dynamic data to use in the email template.
 * @returns {Promise} - A Promise that resolves when the email has been sent.
 */

exports.sendEmail = async (to, templateId, data) => {
  const msg = {
    from: `${env.EMAIL_USERNAME} <${env.EMAIL_FROM}>`,
    to,
    templateId,
    dynamic_template_data: data,
    isMultiple: true,
  };
  return await sgMail.send(msg);
};

const { env } = require('../config/constants');
const { sgMail } = require('../config/sendgrid');

exports.sendEmail = async (to, templateId, data) =>
  await sgMail.send({
    from: `${env.EMAIL_USERNAME} <${env.EMAIL_FROM}>`,
    to,
    templateId,
    dynamic_template_data: data,
    isMultiple: true,
  });

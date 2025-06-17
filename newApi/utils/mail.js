const nodemailer = require("nodemailer");

/**
 * 发件箱配置
 */
const transporter = nodemailer.createTransport({
  host: process.env.MAILER_HOST,
  port: process.env.MAILER_PORT,
  secure: process.env.MAILER_SECURE,
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS,
  },
});

/**
 * 发件箱配置
 */

/**
 * 发送邮件
 * @param email
 * @param subject
 * @param html
 * @param attachments - 可选的附件数组
 * @returns {Promise<void>}
 */
const sendMail = async (email, subject, html, attachments = []) => {
  const mailOptions = {
    from: process.env.MAILER_USER,
    to: email,
    subject,
    html,
  };
  
  if (attachments && attachments.length > 0) {
    mailOptions.attachments = attachments;
  }
  
  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;



/**
 * 发件箱配置
 */

// 必须在任何网络请求之前调用
require('dns').setDefaultResultOrder('ipv4first');
const nodemailer = require('nodemailer');




/**
 * 发件箱配置
 */
const transporter = nodemailer.createTransport({
  host:process.env.MAILER_HOST,
  port:parseInt(process.env.MAILER_PORT, 10),
  secure: false,
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS
  },
  

});

/**
 * 发送邮件
 * @param email
 * @param subject
 * @param html
 * @returns {Promise<void>}
 */
const sendMail = async (email, subject, html) => {
    await transporter.sendMail({
      from: process.env.MAILER_USER,
      to: email,
      subject,
      html,
    });
  }
  
  module.exports = sendMail;
  
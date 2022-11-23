const nodemailer = require('nodemailer')
const fs = require('fs')
const path = require('path')

/**
 * Send e-mail.
 * 
 * @param {String} to 
 * @param {String} subject 
 * @param {String} content 
 */
exports.sendMail = async (to, subject, content) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PWD,
    },
  })

  const info = await transporter.sendMail({
    from: { name: process.env.MAIL_FROM, address: process.env.MAIL_USER },
    to: to,
    subject: subject,
    html: content,
  })

  console.log(info)

  return info.messageId != null
}

/**
 * Parse e-mail HTML template and replace content if replacements provided.
 * 
 * @param {String} template 
 * @param {Array} replacements 
 */
exports.parseEmail = (template, replacements = []) => {
  let content = fs.readFileSync(path.resolve(__dirname, `../content/mails/${template}.html`));

  for (var key of Object.keys(replacements)) {
    content = content.toString().replace(`%${key}%`, replacements[key])
  }

  return content
}
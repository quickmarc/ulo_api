const mongoose = require('mongoose')
const axios = require('axios').default
const { createLogger, format, transports } = require('winston')
const User = require('../models/user')
const Notification = require('../models/notification')

// constants
const smsApiUser = process.env.SMS_USER;
const smsApiPassword = process.env.SMS_PWD;
const smsApiSender = process.env.SMS_SENDER;

exports.smsApiUrl = (message, destination = "") => {
  if (!destination.startsWith('237') && !destination.startsWith('+237'))
    destination = '237' + destination

  return encodeURI("https://obitsms.com/api/bulksms?username=" + smsApiUser + "&password=" + smsApiPassword + "&sender=" + smsApiSender + "&message=" + message + "&destination=" + destination);
}

/**
 * Generate random integer.
 * 
 * @param {Number} length 
 */
exports.randomCode = (length) => {
  let code = "";

  for (i = 0; i < length; i++)
    code += Math.floor(Math.random() * 9).toString();

  return code;
}

/**
 * Generate random string.
 * 
 * @param {Number} length 
 */
exports.randomStr = (length) => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let charactersLength = characters.length;

  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

/**
 * Send given SMS to given phone number.
 * 
 * @param {String} destination 
 * @param {String} sms 
 */
exports.sendSms = async (destination, sms) => {
  const response = await axios.get(this.smsApiUrl(sms, destination)).catch((err) => {
    console.error(err);
    return false;
  });

  return response != false;
}

/**
 * Check if given phone format is correct
 * 
 * @param {String} phone 
 */
exports.checkPhone = (phone) => {
  if (phone.length < 13)
    return false;

  if (!phone.startsWith('+237'))
    return false;

  return true;
}

/**
 * Prefix the given number if under the limit.
 * 
 * @param {Number} number 
 * @param {Number} limit 
 */
exports.zeroPrefix = (number, limit) => {
  let zero = ""

  if (number < limit) {
    for (let i = 0; i < limit.toString().length - number.toString().length; i++) {
      zero += '0'
    }

    return zero + number.toString()
  } else {
    return number.toString()
  }
}

/**
 * Format given date string.
 * 
 * @param {*} date 
 * @returns String
 */
exports.formatDate = (date) => {
  const d = new Date(date)
  return `${helpers.zeroPrefix(d.getDate(), 10)}/${helpers.zeroPrefix(d.getMonth() + 1, 10)}/${d.getFullYear()}`
}

/**
 * Send notification to specified user.
 * 
 * @param {mongoose.Types.ObjectId} to  Receiver user ID
 * @param {String} title  Notification title
 * @param {String} content  Content of the notification
 * @param {String} type  Either `list` or `push`
 * 
 * @returns Boolean
 */
exports.notify = async (to, title, content, type = 'list') => {
  const user = await User.findById(to)
  const exists = await Notification.findOne({ to: to, title: title, body: content, type: type, seen: false })
  if (exists) return false

  if (!user) return false
  else {
    const notification = new Notification({ to: to, title: title, body: content, type: type })
    await notification.save()

    return true
  }
}


/**
 * Log content to the specified channel.
 * 
 * @param {String} message content to log
 * @param {String} level log level: `info`, `warn` or `error`
 * @param {String} type type of log content: `request`, `action` or `server`
 * 
 * @return void
 */
exports.log = (message, level = 'info', type = 'server') => {
  const logger = createLogger({
    level: level,
    exitOnError: false,
    format: format.combine(
      format.timestamp(),
      format.label({ label: type }),
      format.align(),
      format.printf(({ level, message, timestamp, label }) => {
        return `[${timestamp}] [${label}] ${level}: ${message}`
      })
    ),
    transports: [
      new transports.File({ filename: 'logs/error.log', level: 'error' }),
    ],
  })

  if (type == 'server')
    logger.add(new transports.File({ filename: 'logs/server.log', level: 'info' }))

  if (type == 'request')
    logger.add(new transports.File({ filename: 'logs/access.log', level: 'info' }))

  if (type == 'action')
    logger.add(new transports.File({ filename: 'logs/combined.log', level: 'info' }))

  logger.log(level, message)
}
import moment from 'moment'

export function parseStartOfDate(datePart: string | null) {
  if (datePart)
    return moment(datePart).startOf('day').unix() * 1000
  else
    return 0
}

var endOfDate = moment('2050-12-31').endOf('day').unix() * 1000

export function parseEndOfDate(datePart: string | null) {
  if (datePart)
    return moment(datePart).endOf('day').unix() * 1000
  else
    return endOfDate
}

export function nearestMinutes(interval: number, someMoment: moment.Moment) {
  const roundedMinutes = Math.round(someMoment.clone().minute() / interval) * interval
  return someMoment.clone().minute(roundedMinutes).second(0)
}

export function nearestPastMinutes(interval: number, someMoment: moment.Moment) {
  const roundedMinutes = Math.floor(someMoment.minute() / interval) * interval
  return someMoment.clone().minute(roundedMinutes).second(0)
}

export function nearestFutureMinutes(interval: number, someMoment: moment.Moment) {
  const roundedMinutes = Math.ceil(someMoment.minute() / interval) * interval
  return someMoment.clone().minute(roundedMinutes).second(0)
}

/**
 * Generates a MongoDB-style ObjectId in Node.js. Uses nanosecond timestamp in place of counter; 
 * should be impossible for same process to generate multiple objectId in same nanosecond? (clock 
 * drift can result in an *extremely* remote possibility of id conflicts).
 *
 * @returns {string} Id in same format as MongoDB ObjectId.
 */
export function objectId() {
  const os = require('os');
  const crypto = require('crypto');

  let now = new Date()
  const seconds = Math.floor(now.getTime() / 1000).toString(16);
  const machineId = crypto.createHash('md5').update(os.hostname()).digest('hex').slice(0, 6);
  const processId = process.pid.toString(16).slice(0, 4).padStart(4, '0');
  const counter = process.hrtime()[1].toString(16).slice(0, 6).padStart(6, '0');

  return seconds + machineId + processId + counter;
}

export default {
  parseStartOfDate,
  parseEndOfDate,
  nearestMinutes,
  nearestPastMinutes,
  nearestFutureMinutes,
  objectId
}

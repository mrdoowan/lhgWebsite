// npm modules
var moment = require('moment-timezone');

// Helper Functions
module.exports = {
    time: getTimeString,
    date: getDateString,
    dateTime: getDateTimeString,
}

function getTimeString(seconds) {
    return Math.floor(seconds / 60) + ':' + pad(Math.floor(seconds % 60));
}

function pad(num) {
    return ("0"+num).slice(-2);
}

function getDateString(unix, timeZone='EST') {
    return moment.unix(unix).tz(timeZone).format('MM/DD/YYYY');
}

function getDateTimeString(unix, timeZone='EST') {
    return moment.unix(unix).tz(timeZone).format('MM/DD/YYYY - hh:mma');
}
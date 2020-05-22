// npm modules
var moment = require('moment-timezone');

// Helper Functions
module.exports = {
    timeString: getTimeString,
    dateString: getDateString,
}

function getTimeString(seconds) {
    return Math.floor(seconds / 60) + ':' + pad(Math.floor(seconds % 60));
}

function pad(num) {
    return ("0"+num).slice(-2);
}

function getDateString(unix, timeZone='EST') {
    return moment.unix(unix).tz(timeZone).format('YYYY/MM/DD');
}
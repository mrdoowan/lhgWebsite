// Helper Functions

module.exports = {
    timeString: getTimeString,
}

function getTimeString(seconds) {
    return Math.floor(seconds / 60) + ':' + (pad(seconds % 60));
}

function pad(num) {
    return ("0"+num).slice(-2);
}
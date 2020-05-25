module.exports = {
    filterName: filterName,
    getProfilePId: getProfilePIdString,
    getTeamPId: getTeamPIdString,
}
require('dotenv').config({ path: '../.env' });
const Hashids = require('hashids/cjs'); // For hashing and unhashing
const profileHashIds = new Hashids(process.env.PROFILE_HID_SALT, parseInt(process.env.HID_LENGTH));
const teamHashIds = new Hashids(process.env.TEAM_HID_SALT, parseInt(process.env.HID_LENGTH));

// Turn number into string
function strPadZeroes(num, size) {
    let s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

// Turn Profile HId into PId string
function getProfilePIdString(hId) {
    return strPadZeroes(profileHashIds.decode(hId)[0], process.env.PID_LENGTH);
}

// Turn Team HId into PId string
function getTeamPIdString(hId) {
    return strPadZeroes(teamHashIds.decode(hId)[0], process.env.PID_LENGTH);
}

// Lowercases the name and removes all whitespaces
function filterName(name) {
    return name.toLowerCase().replace(/ /g, '');
}
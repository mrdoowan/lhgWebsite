module.exports = {
    filterName: filterName,
    getProfilePId: getProfilePIdString,
    getTeamPId: getTeamPIdString,
    getSeasonTabs: getSeasonTabs,
    getTourneyTabs: getTourneyTabs,
}
require('dotenv').config({ path: '../.env' });
const Hashids = require('hashids/cjs'); // For hashing and unhashing
const profileHashIds = new Hashids(process.env.PROFILE_HID_SALT, parseInt(process.env.HID_LENGTH));
const teamHashIds = new Hashids(process.env.TEAM_HID_SALT, parseInt(process.env.HID_LENGTH));
const Season = require('./seasonData');
const Tournament = require('./tournamentData');

// Turn number into string
function strPadZeroes(num, size) {
    let s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

// Turn Profile HId into PId string
function getProfilePIdString(hId) {
    return strPadZeroes(profileHashIds.decode(hId)[0], parseInt(process.env.PID_LENGTH));
}

// Turn Team HId into PId string
function getTeamPIdString(hId) {
    return strPadZeroes(teamHashIds.decode(hId)[0], parseInt(process.env.PID_LENGTH));
}

// Lowercases the name and removes all whitespaces
function filterName(name) {
    return name.toLowerCase().replace(/ /g, '');
}

function getSeasonTabs(idList) {
    return new Promise(async function(resolve, reject) {
        try {
            let seasonList = [];
            for (let i = 0; i < idList.length; ++i) {
                let seasonId = parseInt(idList[i]);
                seasonList.push({
                    'SeasonPId': seasonId,
                    'SeasonTabName': await Season.getTabName(seasonId),
                    'SeasonShortName': await Season.getShortName(seasonId),
                });
            }
            resolve(seasonList);
        }
        catch (err) { reject(err); }
    });
}

function getTourneyTabs(idList) {
    return new Promise(async function(resolve, reject) {
        try {
            let tourneyList = [];
            for (let i = 0; i < idList.length; ++i) {
                let tnId = parseInt(idList[i]);
                tourneyList.push({
                    'TournamentPId': tnId,
                    'TournamentTabName': await Tournament.getTabName(tnId),
                    'TournamentShortName': await Tournament.getShortName(tnId),
                });
            }
            resolve(tourneyList);
        }
        catch (err) { reject(err); } 
    });
}
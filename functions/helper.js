module.exports = {
    filterName: filterName,
    getProfilePId: getProfilePIdString,
    getProfileHId: getProfileHIdString,
    getTeamPId: getTeamPIdString,
    getTeamHId: getTeamHIdString,
    getSeasonItems: getSeasonItems,
    getTourneyItems: getTourneyItems,
    generateNewPId: generateNewPId,
}
require('dotenv').config({ path: '../.env' });
const { Random } = require('random-js');
const Hashids = require('hashids/cjs'); // For hashing and unhashing
const profileHashIds = new Hashids(process.env.PROFILE_HID_SALT, parseInt(process.env.HID_LENGTH));
const teamHashIds = new Hashids(process.env.TEAM_HID_SALT, parseInt(process.env.HID_LENGTH));
const randomNumber = new Random();
const dynamoDb = require('./dynamoDbHelper');
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

// Encode Profile PId into HId
function getProfileHIdString(pPId) {
    return profileHashIds.encode(pPId);
}

// Encode Team PId into HId
function getTeamHIdString(tPId) {
    return teamHashIds.encode(tPId);
}

function getSeasonItems(idList) {
    return new Promise(async function(resolve, reject) {
        try {
            let seasonList = [];
            for (let i = 0; i < idList.length; ++i) {
                let seasonId = parseInt(idList[i]);
                seasonList.push({
                    'PId': seasonId,
                    'ItemName': await Season.getTabName(seasonId),
                    'ShortName': await Season.getShortName(seasonId),
                });
            }
            resolve(seasonList);
        }
        catch (err) { reject(err); }
    });
}

function getTourneyItems(idList) {
    return new Promise(async function(resolve, reject) {
        try {
            let tourneyList = [];
            for (let i = 0; i < idList.length; ++i) {
                let tnId = parseInt(idList[i]);
                tourneyList.push({
                    'PId': tnId,
                    'ItemName': await Tournament.getTabName(tnId),
                    'ShortName': await Tournament.getShortName(tnId),
                });
            }
            resolve(tourneyList);
        }
        catch (err) { reject(err); } 
    });
}

function generateNewPId(type) {
    return new Promise(async function(resolve, reject) {
        let duplicate = true;
        while (duplicate) {
            let newPId = strPadZeroes(randomNumber.integer(1, 99999999), 8); // 8 digit number
            if (type.toLowerCase() === "profile") {
                if (!(await dynamoDb.getItem('Profile', 'ProfilePId', newPId))) {
                    resolve(newPId);
                    duplicate = false;
                }
            }
            else if (type.toLowerCase() === "team") {
                if (!(await dynamoDb.getItem('Team', 'TeamPId', newPId))) {
                    resolve(newPId);
                    duplicate = false;
                }
            }
            else {
                reject("Generate new PID incorrect Type.");
            }
        }
    })
    
} 
module.exports = {
    filterName: filterName,
    getProfilePId: getProfilePIdString,
    getProfileHId: getProfileHIdString,
    getTeamPId: getTeamPIdString,
    getTeamHId: getTeamHIdString,
    getSeasonItems: getSeasonItems,
    getTourneyItems: getTourneyItems,
    generateNewPId: generateNewPId,
    TTL_DURATION: 60 * 60 * 24,
}

/*  Declaring npm modules */
require('dotenv').config({ path: '../../.env' });
const { Random } = require('random-js');
const Hashids = require('hashids/cjs'); // For hashing and unhashing

const oldEnv = true; // 'true' for Dynamodb, 'false' for MongoDb
const profileHIdSalt = (oldEnv) ? process.env.OLD_PROFILE_HID_SALT : process.env.SALT_PROFILE_HID;
const teamHidSalt = (oldEnv) ? process.env.OLD_TEAM_HID_SALT : process.env.SALT_TEAM_HID;
const hIdLength = parseInt((oldEnv) ? process.env.OLD_HID_LENGTH : process.env.LENGTH_HID);
const profileHashIds = new Hashids(profileHIdSalt, hIdLength);
const teamHashIds = new Hashids(teamHidSalt, hIdLength);
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
    return strPadZeroes(profileHashIds.decode(hId)[0], parseInt(process.env.LENGTH_PID));
}

// Turn Team HId into PId string
function getTeamPIdString(hId) {
    return strPadZeroes(teamHashIds.decode(hId)[0], parseInt(process.env.LENGTH_PID));
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
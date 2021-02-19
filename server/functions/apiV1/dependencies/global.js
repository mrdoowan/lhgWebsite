/*  Declaring npm modules */
const { Random } = require('random-js');
const Hashids = require('hashids/cjs'); // For hashing and unhashing

/*  Import data functions*/
import {
    getSeasonTabName,
    getSeasonShortName,
} from '../seasonData';
import {
    getTournamentShortName,
    getTournamentTabName,
} from '../tournamentData';
import { dynamoDbGetItem } from './dynamoDbHelper';

const oldEnv = true; // 'true' for old salt name, 'false' for new salt name
const profileHIdSalt = (oldEnv) ? process.env.OLD_PROFILE_HID_SALT : process.env.SALT_PROFILE_HID;
const teamHidSalt = (oldEnv) ? process.env.OLD_TEAM_HID_SALT : process.env.SALT_TEAM_HID;
const hIdLength = parseInt((oldEnv) ? process.env.OLD_HID_LENGTH : process.env.LENGTH_HID);
const profileHashIds = new Hashids(profileHIdSalt, hIdLength);
const teamHashIds = new Hashids(teamHidSalt, hIdLength);
const randomNumber = new Random();
console.log(process.env.OLD_PROFILE_HID_SALT);

/**
 * Helper Function:
 * Turn number into string
 * @param {number} num 
 * @param {number} size 
 */
function strPadZeroes(num, size) {
    let s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

export const GLOBAL_CONSTS = {
    TTL_DURATION: 60 * 60 * 12,  // 12 Hours
    MINUTE_AT_EARLY: 15,
    MINUTE_AT_MID: 25,
    BLUE_ID: "100",
    RED_ID: "200",
    SIDE_STRING: { 
        '100': 'Blue', 
        '200': 'Red', 
    },
    BARON_DURATION_PATCH_CHANGE: '9.23',
    // Baron duration is 3 minutes after this patch, 3.5 minutes before it
    OLD_BARON_DURATION: 210, // in seconds
    CURRENT_BARON_DURATION: 180, // in seconds
    LEADERBOARD_NUM: 5
}

/**
 * Turn Profile HId into PId string
 * @param {string} hashId 
 */
export const getProfilePIdFromHash = (hashId) => {
    return strPadZeroes(profileHashIds.decode(hashId)[0], parseInt(process.env.LENGTH_PID));
}

/**
 * Turn Team HId into PId string
 * @param {string} hashId 
 */
export const getTeamPIdFromHash = (hashId) => {
    return strPadZeroes(teamHashIds.decode(hashId)[0], parseInt(process.env.LENGTH_PID));
}

/**
 * Lowercases the name and removes all whitespaces
 * @param {string} name 
 */
export const filterName = (name) => {
    return name.toLowerCase().replace(/ /g, '');
}

/**
 * Encode Profile PId into HId
 * @param {*} profilePId 
 */
export const getProfileHashId = (profilePId) => {
    return profileHashIds.encode(profilePId);
}

/**
 * Encode Team PId into HId
 * @param {*} teamPId 
 */
export const getTeamHashId = (teamPId) => {
    return teamHashIds.encode(teamPId);
}

/**
 * 
 * @param {Array} idList 
 */
export const getSeasonItems = (idList) => {
    return new Promise(async function(resolve, reject) {
        try {
            let seasonList = [];
            for (let i = 0; i < idList.length; ++i) {
                let seasonId = parseInt(idList[i]);
                seasonList.push({
                    'PId': seasonId,
                    'ItemName': await getSeasonTabName(seasonId),
                    'ShortName': await getSeasonShortName(seasonId),
                });
            }
            resolve(seasonList);
        }
        catch (err) { reject(err); }
    });
}

/**
 * 
 * @param {Array} idList 
 */
export const getTourneyItems = (idList) => {
    return new Promise(async function(resolve, reject) {
        try {
            let tourneyList = [];
            for (let i = 0; i < idList.length; ++i) {
                let tnId = parseInt(idList[i]);
                tourneyList.push({
                    'PId': tnId,
                    'ItemName': await getTournamentTabName(tnId),
                    'ShortName': await getTournamentShortName(tnId),
                });
            }
            resolve(tourneyList);
        }
        catch (err) { reject(err); } 
    });
}

/**
 * Generates a new PId dependent on type
 * @param {string} type     'Profile', 'Team' 
 */
export const generateNewPId = (type) => {
    return new Promise(async function(resolve, reject) {
        let duplicate = true;
        while (duplicate) {
            let newPId = strPadZeroes(randomNumber.integer(1, 99999999), 8); // 8 digit number
            if (type.toLowerCase() === "profile") {
                if (!(await dynamoDbGetItem('Profile', 'ProfilePId', newPId))) {
                    resolve(newPId);
                    duplicate = false;
                }
            }
            else if (type.toLowerCase() === "team") {
                if (!(await dynamoDbGetItem('Team', 'TeamPId', newPId))) {
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
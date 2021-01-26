module.exports = {
    newStaff: putNewStaff,
}

/*  Declaring npm modules */
require('dotenv').config({ path: '../../.env' });
const redis = require('redis');
const cache = (process.env.NODE_ENV === 'production') ? redis.createClient(process.env.REDIS_URL) : redis.createClient(process.env.REDIS_PORT);
const bcrypt = require('bcrypt');

/*  Import dependency modules */
const dynamoDb = require('./dependencies/dynamoDbHelper');
const keyBank = require('./dependencies/cacheKeys');
const GLOBAL = require('./dependencies/global');
// Data Functions
import {
    getProfilePIdByName,
    getProfileInfo,
} from './profileData';
const Profile = require('./profileData');

// Need to reset Cache with each new put/post

// Add Staff and give credentials
// BODY TEMPLATE:
// {
//     "profile": "NAME",
//     "password": "PASSWORD_HERE",
//     "admin": true,
//     "moderator": true
// }
function putNewStaff(staff) {
    return new Promise((resolve, reject) => {
        getProfilePIdByName(staff.profile).then((pPId) => {
            if (pPId == null) { resolve(null); return; } // Not Found
            bcrypt.hash(staff.password, parseInt(process.env.SALT_ROUNDS), function(err, hash) {
                if (err) { console.error(err); reject(err); return; }
                dynamoDb.updateItem('Profile', 'ProfilePId', pPId,
                    'SET #pw = :data',
                    {
                        '#pw': 'Password',
                    },
                    {
                        ':data': hash,
                    }
                );
                getProfileInfo(pPId).then((profileInfo) => {
                    profileInfo['Admin'] = staff.admin;
                    profileInfo['Moderator'] = staff.moderator;
                    dynamoDb.updateItem('Profile', 'ProfilePId', pPId,
                        'SET #info = :data',
                        {
                            '#info': 'Information',
                        },
                        {
                            ':data': profileInfo,
                        }
                    );
                    // Update Cache
                    const cacheKey = keyBank.PROFILE_INFO_PREFIX + pPId;
                    cache.set(cacheKey, JSON.stringify(profileInfo, null, 2), 'EX', GLOBAL.TTL_DURATION);
                    profileInfo['Password'] = hash;
                    resolve(profileInfo);
                }).catch((err) => { console.error(err); reject(err); });
            });
        }).catch((err) => { console.error(err); reject(err); });
    });
}
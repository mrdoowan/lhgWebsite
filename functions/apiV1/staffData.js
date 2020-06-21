module.exports = {
    newStaff: putNewStaff,
}

/*  Declaring npm modules */
require('dotenv').config({ path: '../../.env' });
const redis = require('redis');
const cache = (process.env.NODE_ENV === 'production') ? redis.createClient(process.env.REDIS_URL) : redis.createClient(process.env.REDIS_PORT);
const bcrypt = require('bcrypt');

/*  Import helper function modules */
const dynamoDb = require('./dynamoDbHelper');
const keyBank = require('./cacheKeys');
// Data Functions
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
        Profile.getIdByName(staff.profile).then((pPId) => {
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
                Profile.getInfo(pPId).then((profileInfo) => {
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
                    let cacheKey = keyBank.PROFILE_INFO_PREFIX + pPId;
                    cache.set(cacheKey, JSON.stringify(profileInfo, null, 2));
                    profileInfo['Password'] = hash;
                    resolve(profileInfo);
                }).catch((err) => { console.error(err); reject(err); });
            });
        }).catch((err) => { console.error(err); reject(err); });
    });
}
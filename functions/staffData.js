module.exports = {
    newStaff: putNewStaff,
}

/*  Declaring npm modules */
require('dotenv').config({ path: '../.env' });
const redis = require('redis');
const cache = redis.createClient(process.env.REDIS_PORT);

/*  Import helper function modules */
const dynamoDb = require('./dynamoDbHelper');
const keyBank = require('./cacheKeys');
// Data Functions
const Profile = require('./profileData');

// Need to reset Cache with each new put/post

function putNewStaff(profileName, password, admin) {
    return new Promise((resolve, reject) => {
        try {
            let pPId = await Profile.getId(profileName);
            let profileInfo = await Profile.getInfo(pPId);


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
            resolve(profileInfo);
        }
        catch (err) { console.error(err); reject(400); }
    })
}
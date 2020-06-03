module.exports = {
    newStaff: putNewStaff,
}

/*  Declaring npm modules */
require('dotenv').config({ path: '../.env' });
const redis = require('redis');
const cache = redis.createClient(process.env.REDIS_PORT);
const bcrypt = require('bcrypt');

/*  Import helper function modules */
const dynamoDb = require('./dynamoDbHelper');
const keyBank = require('./cacheKeys');
// Data Functions
const Profile = require('./profileData');

// Need to reset Cache with each new put/post

function putNewStaff(staff) {
    return new Promise((resolve, reject) => {
        Profile.getId(staff.profile).then((pPId) => {
            bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS), function(err, salt) {
                if (err) { console.error(err); reject(500); return; }
                bcrypt.hash(staff.password, salt, function(err, hash) {
                    if (err) { console.error(err); reject(500); return; }
                    dynamoDb.updateTest(pPId, 'Password', hash);
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
                        dynamoDb.updateTest(pPId, 'Information', profileInfo);
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
                    }).catch((err) => { console.error(err); reject(400); });
                });
            })
        }).catch((err) => { console.error(err); reject(400); });
    });
}
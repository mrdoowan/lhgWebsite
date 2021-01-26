/*  Declaring npm modules */
require('dotenv').config({ path: '../../.env' });
const redis = require('redis');
const cache = (process.env.NODE_ENV === 'production') ? redis.createClient(process.env.REDIS_URL) : redis.createClient(process.env.REDIS_PORT);
const bcrypt = require('bcrypt');

/*  Import dependency modules */
import { dynamoDbUpdateItem } from './dependencies/dynamoDbHelper';
import { CACHE_KEYS } from './dependencies/cacheKeys'
import {
    GLOBAL_CONSTS,
} from './dependencies/global';
/*  Import data functions */
import {
    getProfilePIdByName,
    getProfileInfo,
} from './profileData';

// Need to reset Cache with each new put/post

// Add Staff and give credentials
// BODY TEMPLATE:
// {
//     "profile": "NAME",
//     "password": "PASSWORD_HERE",
//     "admin": true,
//     "moderator": true
// }
export const putNewStaff = (staff) => {
    return new Promise((resolve, reject) => {
        getProfilePIdByName(staff.profile).then((pPId) => {
            if (pPId == null) { resolve(null); return; } // Not Found
            bcrypt.hash(staff.password, parseInt(process.env.SALT_ROUNDS), function(err, hash) {
                if (err) { console.error(err); reject(err); return; }
                dynamoDbUpdateItem('Profile', 'ProfilePId', pPId,
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
                    dynamoDbUpdateItem('Profile', 'ProfilePId', pPId,
                        'SET #info = :data',
                        {
                            '#info': 'Information',
                        },
                        {
                            ':data': profileInfo,
                        }
                    );
                    // Update Cache
                    const cacheKey = CACHE_KEYS.PROFILE_INFO_PREFIX + pPId;
                    cache.set(cacheKey, JSON.stringify(profileInfo, null, 2), 'EX', GLOBAL_CONSTS.TTL_DURATION);
                    profileInfo['Password'] = hash;
                    resolve(profileInfo);
                }).catch((err) => { console.error(err); reject(err); });
            });
        }).catch((err) => { console.error(err); reject(err); });
    });
}
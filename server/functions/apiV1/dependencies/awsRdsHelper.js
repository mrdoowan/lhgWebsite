
// Import
import { RDS_TYPE } from '../../../services/constants';
import { unix as _unix } from 'moment-timezone';

/*  Declaring AWS npm modules */
const AWS = require('aws-sdk'); // Interfacing with DynamoDB
/*  Configurations of npm modules */
AWS.config.update({ region: 'us-east-2' });
const rds = new AWS.RDS({apiVersion: '2014-10-31'});

/**
 * 
 * @param {*} rdsType   'Production', 'Test'. If neither, default to based on environment
 */
const getRdsInstantName = (rdsType) => {
    return (rdsType === RDS_TYPE.TEST) ? // Test
        `${process.env.MYSQL_INSTANCE}-test` : 
        (rdsType === RDS_TYPE.PROD) ? // Production
        process.env.MYSQL_INSTANCE :
        (process.env.TEST_DB === 'false' || process.env.NODE_ENV === 'production') ? // Default to production
        process.env.MYSQL_INSTANCE : 
        `${process.env.MYSQL_INSTANCE}-test`;
}

/**
 * Converts unix value into a Date (i.e. 01/01/2020)
 * @param {number} unix         time value in ms
 * @param {string} format       Default is 'MM/DD/YYYY'
 * @param {string} timeZone     Default is 'EST'
 */
export const getDateString = (unix, format='MM/DD/YYYY', timeZone='EST') => {
    return _unix(unix).tz(timeZone).format(format);
}

/**
 * Returns 'stopped', 'stopping', 'available', 'starting'
 * https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.DBInstance.Status.html
 * @param {*} rdsType   'Production', 'Test'. If neither, default to based on environment
 */
export const checkRdsStatus = (rdsType = null) => {
    return new Promise((resolve, reject) => {
        const rdsInstantName = getRdsInstantName(rdsType);

        const params = {
            DBInstanceIdentifier: rdsInstantName,
        };
        rds.describeDBInstances(params, function(err, data) {
            if (err) {
                reject(err);
                return;
            }
            else {
                resolve(data.DBInstances[0].DBInstanceStatus);
            }
        });
    });
}

/**
 * Start the RDS instance when 'Stopped'
 * @param {*} rdsType   'Production', 'Test'. If neither, default to based on environment
 */
export const startRdsInstance = (rdsType = null) => {
    return new Promise((resolve, reject) => {
        const rdsInstantName = getRdsInstantName(rdsType);

        const params = {
            DBInstanceIdentifier: rdsInstantName,
        };
        rds.startDBInstance(params, function(err, data) {
            if (err) {
                reject(err);
                return;
            }
            else {
                resolve(data);
            }
        });
    });
}

/**
 * Stop the RDS instance when 'Available'
 * @param {*} rdsType   'Production', 'Test'. If neither, default to based on environment
 */
export const stopRdsInstance = (rdsType = null) => {
    return new Promise((resolve, reject) => {
        const rdsInstantName = getRdsInstantName(rdsType);
        const dateString = getDateString((Date.now() / 1000), 'YYYY-MM-DD-HH-MM');

        const params = {
            DBInstanceIdentifier: rdsInstantName,
            DBSnapshotIdentifier: `${rdsInstantName}-snapshot-${dateString}`
        };
        rds.stopDBInstance(params, function(err, data) {
            if (err) {
                reject(err); return;
            }
            else {
                resolve(data);
            }
        });
    });
}
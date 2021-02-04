/*  Declaring AWS npm modules */
const AWS = require('aws-sdk'); // Interfacing with DynamoDB
/*  Configurations of npm modules */
AWS.config.update({ region: 'us-east-2' });
const rds = new AWS.RDS({apiVersion: '2014-10-31'});

// Import
import { getDateString } from '../../../client/src/util/StringHelper';

/**
 * Returns 'stopped', 'stopping', 'available', 'starting'
 * https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.DBInstance.Status.html
 */
export const checkRdsStatus = () => {
    return new Promise((resolve, reject) => {
        // const rdsInstantName = (process.env.TEST_DB === 'true') ? 
        //     `${process.env.MYSQL_INSTANCE}-test` : 
        //     process.env.MYSQL_INSTANCE;
        const rdsInstantName = process.env.MYSQL_INSTANCE;

        const params = {
            DBInstanceIdentifier: rdsInstantName,
        };
        rds.describeDBInstances(params, function(err, data) {
            if (err) {
                console.error(err, err.stack);
                reject(err.stack);
                return;
            }
            else {
                resolve(data.DBInstances[0].DBInstanceStatus);
            }
        });
    });
}

export const startRdsInstance = () => {
    return new Promise((resolve, reject) => {
        // const rdsInstantName = (process.env.TEST_DB === 'true') ? 
        //     `${process.env.MYSQL_INSTANCE}-test` : 
        //     process.env.MYSQL_INSTANCE;
        const rdsInstantName = process.env.MYSQL_INSTANCE;

        const params = {
            DBInstanceIdentifier: rdsInstantName,
        };
        rds.startDBInstance(params, function(err, data) {
            if (err) { 
                console.error(err, err.stack);
                reject(err.stack);
                return;
            }
            else {
                resolve(data);
            }
        });
    });
}

export const stopRdsInstance = () => {
    return new Promise((resolve, reject) => {
        // const rdsInstantName = (process.env.TEST_DB === 'true') ? 
        //     `${process.env.MYSQL_INSTANCE}-test` : 
        //     process.env.MYSQL_INSTANCE;
        const rdsInstantName = process.env.MYSQL_INSTANCE;
        const dateString = getDateString((Date.now() / 1000), 'YYYY-MM-DD');

        const params = {
            DBInstanceIdentifier: rdsInstantName,
            DBSnapshotIdentifier: `${rdsInstantName}-snapshot-${dateString}`
        };
        rds.stopDBInstance(params, function(err, data) {
            if (err) { 
                console.error(err, err.stack);
                reject(err.stack);
                return;
            }
            else {
                resolve(data);
            }
        });
    });
}
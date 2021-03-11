/*  Declaring AWS npm modules */
const AWS = require('aws-sdk'); // Interfacing with DynamoDB
import { unix as _unix } from 'moment-timezone';
import { getDateString } from './global';
/*  Configurations of npm modules */
AWS.config.update({ region: 'us-east-2' });
const dynamoDb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
const dynamoDBClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

/*  'false' to add to test DB. */	
/*  'true' to add to production DB. */	
const CHANGE_DYNAMO = (process.env.TEST_DB === 'false') || (process.env.NODE_ENV === 'production');

/**
 * Gets an item from the Table based on keyValue. Returns 'undefined' if key item does NOT EXIST
 * @param {string} tableName        Table name of DynamoDb
 * @param {string} partitionName    Column name of the Partition Key
 * @param {*} keyItem               Specific item to look for
 */
export const dynamoDbGetItem = (tableName, partitionName, keyItem) => {
    const params = {
        TableName: (CHANGE_DYNAMO) ? tableName : `Test-${tableName}`,
        Key: {
            [partitionName]: keyItem
        }
    };
    return new Promise(function(resolve, reject) {
        try {
            dynamoDBClient.get(params, function(err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    console.log(`${(!CHANGE_DYNAMO) ? '[TEST] ' : ''}Dynamo DB: Get Item '${keyItem}' from Table '${tableName}'`);
                    resolve(data['Item']);
                }
            });
        }
        catch (error) {
            console.error(`${(!CHANGE_DYNAMO) ? '[TEST] ' : ''}ERROR - getItemInDynamoDB '${tableName}' Promise rejected with Item '${keyItem}'.`)
            reject(error);
        }
    });
}

/**
 * PUTs a DynamoDb Item into DynamoDb
 * @param {string} tableName    Table name of DynamoDb
 * @param {Object} items        The entire object being put into DynamoDb
 * @param {*} keyItem           Only used for debugging purposes
 */
export const dynamoDbPutItem = (tableName, items, keyItem) => {
    const params = {
        TableName: (CHANGE_DYNAMO) ? tableName : `Test-${tableName}`,
        Item: items
    };
    return new Promise(function(resolve, reject) {
        dynamoDBClient.put(params, function(err, data) {
            if (err) {
                console.error(`${(!CHANGE_DYNAMO) ? '[TEST] ' : ''}ERROR - putItemInDynamoDB '${tableName}' Promise rejected.`);
                reject(err);
            }
            else {
                console.log(`${(!CHANGE_DYNAMO) ? '[TEST] ' : ''}Dynamo DB: Put Item '${keyItem}' into '${tableName}' Table!"`);
                resolve(data);
            }
        });
    });
}

/**
 * Updates a DynamoDb Item based on keyObject + valueObject condition
 * @param {string} tableName        DynamoDb Table name
 * @param {string} partitionName    Column name of the Table's Partition Key
 * @param {*} key                   Item Key to update
 * @param {string} updateExp        The Condition to update (i.e. 'SET #glog.#sId = :data')
 * @param {Object} keyObject        Map of Keys (i.e. { '#glog': 'GameLog' })
 * @param {Object} valueObject      Map of Values (i.e. { ':data': (DATA) })
 */
export const dynamoDbUpdateItem = (tableName, partitionName, key, updateExp, keyObject, valueObject) => {
    const params = {
        TableName: (CHANGE_DYNAMO) ? tableName : `Test-${tableName}`,
        Key: {
            [partitionName]: key
        },
        UpdateExpression: updateExp,
        ExpressionAttributeNames: keyObject,
        ExpressionAttributeValues: valueObject
    };
    return new Promise(function(resolve, reject) {
        dynamoDBClient.update(params, function(err, data) {
            if (err) {
                console.error(`${(!CHANGE_DYNAMO) ? '[TEST] ' : ''}ERROR - updateItemInDynamoDB '${tableName}' Promise rejected.`);
                reject(err); 
            }
            else {
                console.log(`${(!CHANGE_DYNAMO) ? '[TEST] ' : ''}Dynamo DB: Update Item '${key}' in Table '${tableName}'`);
                resolve(data);
            }
        });
    });
}

/**
 * Returns a List based on the Scan
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#scan-property
 * https://stackoverflow.com/questions/44589967/how-to-fetch-scan-all-items-from-aws-dynamodb-using-node-js
 * Returns empty array [] if key item does NOT EXIST
 * @param {string} tableName        DynamoDb Table Name
 * @param {List} getAttributes      Root Item to get
 * @param {string} attributeName    Criteria Column Name (to refine search/condition)
 * @param {string} attributeValue   Root value for attributeName
 */ 
export const dynamoDbScanTable = (tableName, getAttributes=[], attributeName=null, attributeValue=null) => {
    const params = {
        TableName: (CHANGE_DYNAMO) ? tableName : `Test-${tableName}`,
    };
    if (getAttributes.length > 0) {
        params['ProjectionExpression'] = getAttributes.join();
    }
    if (attributeName != null && attributeValue != null) {
        params['FilterExpression'] = attributeName + " = :val";
        params['ExpressionAttributeValues'] = { ':val': attributeValue }
    }
    return new Promise(async function(resolve, reject) {
        try {
            let scanResults = [];
            let data;
            do{
                data = await dynamoDBClient.scan(params).promise();
                data.Items.forEach((item) => scanResults.push(item));
                params.ExclusiveStartKey  = data.LastEvaluatedKey;
                console.log(`${(!CHANGE_DYNAMO) ? '[TEST] ' : ''}Dynamo DB: Scan operation on Table '${tableName}' LastEvaluatedKey: '${data.LastEvaluatedKey}'`);
            }while(typeof data.LastEvaluatedKey != "undefined");
            resolve(scanResults);
        }
        catch (err) {
            reject(err);
        }
    });
}

/**
 * Deletes an item from the specific Table
 * @param {string} tableName        DynamoDb Table Name
 * @param {string} partitionName    Column name of the Partition Key
 * @param {*} keyItem               Value of Partition Key to remove
 * @param {boolean} testFlag        Deletes the item from test DB
 */
export const dynamoDbDeleteItem = (tableName, partitionName, keyItem) => {
    const params = {
        TableName: (CHANGE_DYNAMO) ? tableName : `Test-${tableName}`,
        Key: {
            [partitionName]: keyItem,
        }
    }
    return new Promise(function(resolve, reject) {
        dynamoDBClient.delete(params, function(err, data) {
            if (err) {
                console.error(`${(!CHANGE_DYNAMO) ? '[TEST] ' : ''}ERROR - deleteItemInDynamoDB Promise rejected.`);
                reject(err); 
            }
            else {
                console.log(`${(!CHANGE_DYNAMO) ? '[TEST] ' : ''}Dynamo DB: Deleted Item '${keyItem}' in Table '${tableName}'`);
                resolve(data);
            }
        })
    });
}

/**
 * 
 * @param {string} tableName 
 */
export const dynamoDbCreateBackup = (tableName) => {
    const dateString = getDateString((Date.now() / 1000), 'YYYY-MM-DD');
    const params = {
        BackupName: `${dateString}_${tableName}`,
        TableName: tableName,
    };
    return new Promise(function(resolve, reject) {
        dynamoDb.createBackup(params, function(err, data) {
            if (err) {
                console.error(`ERROR - dynamoDbCreateBackup Promise rejected.`);
                reject(err); 
            }
            else {
                console.log(`Dynamo DB: Creating backup Table '${tableName}'`);
                resolve(data);
            }
        });
    });
}
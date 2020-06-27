// Modularize the DynamoDB functions
module.exports = {
    getItem: getItemInDynamoDB,
    updateItem: updateItemInDynamoDB,
    putItem: putItemInDynamoDB,
    scanTable: scanTableLoopInDynamoDB,
    deleteItem: deleteItemInDynamoDB,
}

/*  Declaring AWS npm modules */
var AWS = require('aws-sdk'); // Interfacing with DynamoDB
require('dotenv').config({ path: '../../.env' });
/*  Configurations of npm modules */
AWS.config.update({ region: 'us-east-2' });
var dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

/*  'false' to test without affecting the databases. */
/*  'true' to add to production. */
const CHANGE_DB = false;
const CHANGE_DYNAMO = CHANGE_DB || (process.env.NODE_ENV === 'production');

// Returns 'undefined' if key item does NOT EXIST
function getItemInDynamoDB(tableName, partitionName, keyValue) {
    var params = {
        TableName: tableName,
        Key: {
            [partitionName]: keyValue
        }
    };
    return new Promise(function(resolve, reject) {
        try {
            dynamoDB.get(params, function(err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    console.log(`Dynamo DB: Get Item '${keyValue}' from Table '${tableName}'`);
                    resolve(data['Item']);
                }
            });
        }
        catch (error) {
            console.error(`ERROR - getItemInDynamoDB '${tableName}' Promise rejected with Item '${keyValue}'.`)
            reject(error);
        }
    });
}

// DETAILED FUNCTION DESCRIPTION XD
function putItemInDynamoDB(tableName, items, keyValue) {
    if (CHANGE_DYNAMO) {
        let params = {
            TableName: tableName,
            Item: items
        };
        return new Promise(function(resolve, reject) {
            dynamoDB.put(params, function(err, data) {
                if (err) {
                    console.error(`ERROR - putItemInDynamoDB '${tableName}' Promise rejected.`);
                    reject(err);
                }
                else {
                    console.log(`Dynamo DB: Put Item '${keyValue}' into '${tableName}' Table!"`);
                    resolve(data);
                }
            });
        });
    }
    else {
        // Puts into Test DB instead
        let params = {
            TableName: 'Test',
            Item: items
        };
        params['Item']['TestId'] = `${tableName}-PUT-${keyValue.toString()}`;
        return new Promise(function(resolve, reject) {
            dynamoDB.put(params, function(err, data) {
                if (err) {
                    console.error("ERROR - putTestInDynamoDB Promise rejected.");
                    reject(err);
                }
                else {
                    console.log(`[TEST - PUT] Dynamo DB: Item '${keyValue}' into '${tableName}' Table`);
                    resolve(data);
                }
            });
        });
    }
}

// DETAILED FUNCTION DESCRIPTION XD
function updateItemInDynamoDB(tableName, partitionName, key, updateExp, keyName, valueObject) {
    let params = {
        TableName: tableName,
        Key: {
            [partitionName]: key
        },
        UpdateExpression: updateExp,
        ExpressionAttributeNames: keyName,
        ExpressionAttributeValues: valueObject
    };
    if (CHANGE_DYNAMO) {
        return new Promise(function(resolve, reject) {
            dynamoDB.update(params, function(err, data) {
                if (err) {
                    console.error(`ERROR - updateItemInDynamoDB '${tableName}' Promise rejected.`)
                    reject(err); 
                }
                else {
                    console.log(`Dynamo DB: Update Item '${key}' in Table '${tableName}'`);
                    resolve(data);
                }
            });
        });
    }
    else {
        // Puts into Test DB instead
        let params = {
            TableName: 'Test',
            Item: {
                'TestId': `${tableName}-UPDATE-${key.toString()}-${updateExp}`,
                'Value': valueObject,
            },
        };
        return new Promise(function(resolve, reject) {
            dynamoDB.put(params, function(err, data) {
                if (err) {
                    console.error("ERROR - updateTestInDynamoDB Promise rejected.")
                    reject(err); 
                }
                else {
                    console.log(`[TEST - UPDATE] Dynamo DB TEST: Item '${key}' in Table '${tableName}'`);
                    resolve(data);
                }
            });
        });
    }
}

// Returns a List based on the Scan
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#scan-property
// https://stackoverflow.com/questions/44589967/how-to-fetch-scan-all-items-from-aws-dynamodb-using-node-js
// Returns empty array [] if key item does NOT EXIST
function scanTableLoopInDynamoDB(tableName, getAttributes=[], attributeName=null, attributeValue=null) {
    const params = {
        TableName: tableName
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
                data = await dynamoDB.scan(params).promise();
                data.Items.forEach((item) => scanResults.push(item));
                params.ExclusiveStartKey  = data.LastEvaluatedKey;
                console.log(`Dynamo DB: Scan operation on Table '${tableName}' LastEvaluatedKey: '${data.LastEvaluatedKey}'`);
            }while(typeof data.LastEvaluatedKey != "undefined");
            resolve(scanResults);
        }
        catch (err) {
            reject(err);
        }
    });
}

function deleteItemInDynamoDB(tableName, partitionName, key) {
    let params = {
        TableName: tableName,
        Key: {
            [partitionName]: key,
        }
    }
    if (CHANGE_DYNAMO) {
        return new Promise(async function(resolve, reject) {
            dynamoDB.delete(params, function(err, data) {
                if (err) {
                    console.error("ERROR - deleteItemInDynamoDB Promise rejected.")
                    reject(err); 
                }
                else {
                    console.log(`Dynamo DB: Deleted Item '${key}' in Table '${tableName}'`);
                    resolve(data);
                }
            })
        })
    }
    else {
        console.log(`[TEST - DELETE] Dynamo DB TEST: Item '${key}' in Table '${tableName}'`);
    }
}
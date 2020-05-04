// Modularize the DynamoDB functions
module.exports = {
    getItem: getItemInDynamoDB,
    updateItem: updateItemInDynamoDB,
    doesItemExist: doesItemExistInDynamoDB,
    putItem: putItemInDynamoDB,
    scanTable: scanTableLoopInDynamoDB,
}

/*  Declaring AWS npm modules */
var AWS = require('aws-sdk'); // Interfacing with DynamoDB
/*  Configurations of npm modules */
AWS.config.update({ region: 'us-east-2' });
var dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

/*  Put 'false' to test without affecting the databases. */
const PUT_INTO_DYNAMO = false;       // 'true' when comfortable to push into DynamoDB
/*  Put 'false' to not debug. */
const DEBUG_DYNAMO = false;

const GET_ITEM_NUM_ARGS = 3;
// DETAILED FUNCTION DESCRIPTION XD
function getItemInDynamoDB(tableName, partitionName, itemName) {
    var params = {
        TableName: tableName,
        Key: {
            [partitionName]: itemName
        }
    };
    if (arguments.length > GET_ITEM_NUM_ARGS) {
        var argArray = Array.prototype.slice.call(arguments);
        var itemNames = argArray.slice(GET_ITEM_NUM_ARGS);
        params['AttributesToGet'] = itemNames;
    }
    return new Promise(function(resolve, reject) {
        try {
            dynamoDB.get(params, function(err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    console.log("Dynamo DB: Get Item \'" + itemName + "\' from Table \"" + tableName + "\"");
                    resolve(data['Item']);
                }
            });
        }
        catch (error) {
            console.error("ERROR - getItemInDynamoDB \'" + tableName + "\' Promise rejected with Item \'" + itemName + "\'.")
            reject(error);
        }
    });
}

// DETAILED FUNCTION DESCRIPTION XD
function doesItemExistInDynamoDB(tableName, partitionName, key) {
    var params = {
        TableName: tableName,
        Key: {
            [partitionName]: key
        },
        AttributesToGet: [partitionName],
    };
    return new Promise(function(resolve, reject) {
        try {
            dynamoDB.get(params, function(err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve('Item' in data);
                }
            });
        }
        catch (error) {
            console.error("ERROR - doesItemExistInDynamoDB \'" + tableName + "\' Promise rejected.");
            reject(error);
        }
    });
}

// DETAILED FUNCTION DESCRIPTION XD
function putItemInDynamoDB(tableName, items, key) {
    if (PUT_INTO_DYNAMO) {
        var params = {
            TableName: tableName,
            Item: items
        };
        return new Promise(function(resolve, reject) {
            dynamoDB.put(params, function(err, data) {
                if (err) {
                    console.error("ERROR - putItemInDynamoDB \'" + tableName + "\' Promise rejected.");
                    reject(err);
                }
                else {
                    console.log("Dynamo DB: Put Item \'" + key + "\' into \"" + tableName + "\" Table!");
                    resolve(data);
                }
            });
        });
    }
    else {
        // debugging
        if (DEBUG_DYNAMO) { console.log("DynamoDB Table", "\'" + tableName + "\'"); console.log(JSON.stringify(items)); }
    }
}

// DETAILED FUNCTION DESCRIPTION XD
function updateItemInDynamoDB(tableName, partitionName, key, updateExp, expAttNames, expAttValues) {
    var params = {
        TableName: tableName,
        Key: {
            [partitionName]: key
        },
        UpdateExpression: updateExp,
        ExpressionAttributeNames: expAttNames,
        ExpressionAttributeValues: expAttValues
    };
    if (PUT_INTO_DYNAMO) {
        return new Promise(function(resolve, reject) {
            dynamoDB.update(params, function(err, data) {
                if (err) {
                    console.error("ERROR - updateItemInDynamoDB \'" + tableName + "\' Promise rejected.")
                    reject(err); 
                }
                else {
                    console.log("Dynamo DB: Update Item \'" + key + "\' in Table \"" + tableName + "\"");
                    resolve(data);
                }
            });
        });
    }
}

const SCAN_ITEM_NUM_ARGS = 1;
// DETAILED FUNCTION DESCRIPTION XD
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#scan-property
// https://stackoverflow.com/questions/44589967/how-to-fetch-scan-all-items-from-aws-dynamodb-using-node-js
function scanTableLoopInDynamoDB(tableName) {
    const params = {
        TableName: tableName
    };
    if (arguments.length > SCAN_ITEM_NUM_ARGS) {
        var argArray = Array.prototype.slice.call(arguments);
        var itemNames = argArray.slice(GET_ITEM_NUM_ARGS);
        params['ProjectionExpression'] = itemNames.join();
    }
    return new Promise(async function(resolve, reject) {
        try {
            let scanResults = [];
            let data;
            do{
                data = await dynamoDB.scan(params).promise();
                data.Items.forEach((item) => scanResults.push(item));
                params.ExclusiveStartKey  = data.LastEvaluatedKey;
                console.log("Dynamo DB: Scan operation on Table '" + tableName + "' LastEvaluatedKey: '" + data.LastEvaluatedKey + "'");
            }while(typeof data.LastEvaluatedKey != "undefined");
            resolve(scanResults);
        }
        catch (err) {
            reject(err);
        }
    });
}
/*  Declaring AWS npm modules */
const AWS = require('aws-sdk'); // Interfacing with DynamoDB
import { unix as _unix } from 'moment-timezone';
import { getDateString } from './global';
import {
  PARTITION_KEY_MAP,
} from '../../../services/constants';

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
 * @param {*} keyName               Specific item to look for
 */
export const dynamoDbGetItem = (tableName, keyName) => {
  const partitionKey = PARTITION_KEY_MAP[tableName];
  const params = {
    TableName: (CHANGE_DYNAMO) ? tableName : `Test-${tableName}`,
    Key: {
      [partitionKey]: keyName
    }
  };
  return new Promise(function (resolve, reject) {
    try {
      dynamoDBClient.get(params, function (err, data) {
        if (err) {
          reject(err);
        }
        else {
          console.log(`${(!CHANGE_DYNAMO) ? '[TEST] ' : ''}Dynamo DB: Get Item '${keyName}' from Table '${tableName}'`);
          resolve(data['Item']);
        }
      });
    }
    catch (error) {
      console.error(`${(!CHANGE_DYNAMO) ? '[TEST] ' : ''}ERROR - getItemInDynamoDB '${tableName}' Promise rejected with Item '${keyName}'.`)
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
  return new Promise(function (resolve, reject) {
    dynamoDBClient.put(params, function (err, data) {
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
 * @param {*} keyName               Item Key to update
 * @param {string} updateExp        The Condition to update (i.e. 'SET #glog.#sId = :data')
 * @param {Object} keyObject        Map of Keys (i.e. { '#glog': 'GameLog' })
 * @param {Object} valueObject      Map of Values (i.e. { ':data': (DATA) })
 */
export const dynamoDbUpdateItem = (tableName, keyName, updateExp, keyObject, valueObject) => {
  const partitionKey = PARTITION_KEY_MAP[tableName];
  const params = {
    TableName: (CHANGE_DYNAMO) ? tableName : `Test-${tableName}`,
    Key: {
      [partitionKey]: keyName
    },
    UpdateExpression: updateExp,
    ExpressionAttributeNames: keyObject,
    ExpressionAttributeValues: valueObject
  };
  return new Promise(function (resolve, reject) {
    dynamoDBClient.update(params, function (err, data) {
      if (err) {
        console.error(`${(!CHANGE_DYNAMO) ? '[TEST] ' : ''}ERROR - updateItemInDynamoDB '${tableName}' Promise rejected.`);
        reject(err);
      }
      else {
        console.log(`${(!CHANGE_DYNAMO) ? '[TEST] ' : ''}Dynamo DB: Update Item '${keyName}' in Table '${tableName}'`);
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
export const dynamoDbScanTable = (tableName, getAttributes = [], attributeName = null, attributeValue = null) => {
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
  return new Promise(async function (resolve, reject) {
    try {
      let scanResults = [];
      let data;
      do {
        data = await dynamoDBClient.scan(params).promise();
        data.Items.forEach((item) => scanResults.push(item));
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        console.log(`${(!CHANGE_DYNAMO) ? '[TEST] ' : ''}Dynamo DB: Scan operation on Table '${tableName}' LastEvaluatedKey: '${data.LastEvaluatedKey}'`);
      } while (typeof data.LastEvaluatedKey != "undefined");
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
 * @param {*} keyName               Value of Partition Key to remove
 */
export const dynamoDbDeleteItem = (tableName, keyName) => {
  const partitionKey = PARTITION_KEY_MAP[tableName];
  const params = {
    TableName: (CHANGE_DYNAMO) ? tableName : `Test-${tableName}`,
    Key: {
      [partitionKey]: keyName,
    }
  }
  return new Promise(function (resolve, reject) {
    dynamoDBClient.delete(params, function (err, data) {
      if (err) {
        console.error(`${(!CHANGE_DYNAMO) ? '[TEST] ' : ''}ERROR - deleteItemInDynamoDB Promise rejected.`);
        reject(err);
      }
      else {
        console.log(`${(!CHANGE_DYNAMO) ? '[TEST] ' : ''}Dynamo DB: Deleted Item '${keyName}' in Table '${tableName}'`);
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
  return new Promise(function (resolve, reject) {
    dynamoDb.createBackup(params, function (err, data) {
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

/**
 * 
 * @param {string} tableName 
 * @returns Promise
 */
export const dynamoDbCreateTestTable = (tableName) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 8); // 1 week ago (+1 day)
  const listBackupsParams = {
    TableName: tableName,
    TimeRangeLowerBound: oneWeekAgo,
  };
  const testTableName = `Test-${tableName}`;
  return new Promise((resolve, reject) => {
    dynamoDb.listBackups(listBackupsParams, async (err, data) => {
      if (err) {
        console.error(`ERROR - dynamoDbCreateTestTable '${tableName}' Promise rejected. DynamoDb listBackups failed.`);
        reject(err);
        return;
      }
      const { BackupSummaries } = data;
      if (BackupSummaries.length > 0) {
        const backupTable = BackupSummaries[0];
        // dynamoDb.deleteTable of `Test-${tableName}`
        const targetTableParams = {
          TableName: testTableName,
        };
        dynamoDb.deleteTable(targetTableParams, (err, data) => {
          if (err) {
            console.error(`ERROR - dynamoDbCreateTestTable '${tableName}' Promise rejected. DynamoDb deleteTable failed.`);
            reject(err);
            return;
          }
          console.log(`Deleting '${testTableName}' table.`);
          dynamoDb.waitFor('tableNotExists', targetTableParams, (err, data) => {
            if (err) {
              console.error(`ERROR - dynamoDbCreateTestTable '${tableName}' Promise rejected. DynamoDb waitFor failed.`);
              reject(err);
              return;
            }
            console.log(`Table '${testTableName}' deleted.`);
            // dynamoDb.restoreTableFromBackup ARN and rename with `Test-${tableName}`
            const restoreTableParams = {
              BackupArn: backupTable.BackupArn,
              TargetTableName: testTableName,
              ProvisionedThroughputOverride: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1,
              },
            }
            console.log(`Restoring Table '${testTableName}'`);
            dynamoDb.restoreTableFromBackup(restoreTableParams, async (err, data) => {
              if (err) {
                console.error(`ERROR - dynamoDbCreateTestTable '${tableName}' Promise rejected. DynamoDb restoreTableFromBackup failed.`)
                reject(err);
                return;
              }
              dynamoDb.waitFor('tableExists', targetTableParams, (err, data) => {
                if (err) {
                  console.error(`ERROR - dynamoDbCreateTestTable '${tableName}' Promise rejected. DynamoDb waitFor failed.`);
                  reject(err);
                  return;
                }
                console.log(`Table '${testTableName}' restored.`);
                resolve(`Table '${testTableName}' restored from backup.`);
              }); 
            });
          });
        });
      }
      else {
        const errMsg = `ERROR - Could not find '${tableName}' backups within the last week.`;
        console.error(errMsg);
        reject({ error: errMsg });
      }
    });
  });
}
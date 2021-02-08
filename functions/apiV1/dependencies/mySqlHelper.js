/*  Declaring MySQL npm modules */
const mysql = require('mysql'); // Interfacing with mysql DB

/*  'false' to test without affecting the databases. */
/*  'true' when comfortable changing MySQL db */
const PROD_MYSQL = (process.env.TEST_DB === 'false') || (process.env.NODE_ENV === 'production');

/*  Configuration of npm modules */
const sqlConfig = {
    connectionLimit: 20,
    host: (PROD_MYSQL) ? process.env.MYSQL_ENDPOINT : process.env.MYSQL_TEST_ENDPOINT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT, 
    database: process.env.MYSQL_DATABASE_STATS,
};
const sqlPool = mysql.createPool(sqlConfig);

/**
 * Call Stored Procedure from MySQL
 * @param {string} sProcName 
 */
export function mySqlCallSProc(sProcName) {
    const argArray = arguments; // Because arguments gets replaced by the fxn below
    return new Promise(function(resolve, reject) {
        try {
            let queryStr = `CALL ${sProcName}(`;
            for (let i = 1; i < argArray.length; ++i) {
                let arg = argArray[i];
                arg = (typeof arg === "string") ? `'${arg}'` : arg;
                queryStr += (arg + ",");
            }
            if (argArray.length > 1) {
                queryStr = queryStr.slice(0, -1); // trimEnd of last comma
            }
            queryStr += ");";

            sqlPool.getConnection(function(err, connection) {
                if (err) { reject(err); }
                connection.query(queryStr, function(error, results, fields) {
                    connection.release();
                    if (error) { reject(error); }
                    console.log(`${(!PROD_MYSQL) ? '[TEST] ' : ''}MySQL: Called SProc '${sProcName}' with params '${Array.from(argArray).slice(1)}'`);
                    if (results == null) { resolve({}); }
                    else { resolve(results[0]); } // Returns an Array of 'RowDataPacket'
                });
            });
        }
        catch (error) {
            console.error(`ERROR - sProcMySqlQuery '${sProcName}' Promise rejected.`);
            reject(error);
        }
    });
}

/**
 * MySQL Insert query
 * @param {object} queryObject  Each key is the "Column Name" for its values
 * @param {string} tableName    Table name in MySQL
 */
export const mySqlInsertQuery = (queryObject, tableName) => {
    return new Promise(function(resolve, reject) {
        try {
            let queryStr = 'INSERT INTO ' + tableName + ' (';
            Object.keys(queryObject).forEach(function(columnName) {
                queryStr += (columnName + ',');
            });
            queryStr = queryStr.slice(0, -1); // trimEnd of character
            queryStr += ') VALUES (';
            Object.values(queryObject).forEach(function(value) {
                value = (typeof value === "string") ? '\'' + value + '\'' : value;
                queryStr += (value + ',');
            });
            queryStr = queryStr.slice(0, -1); // trimEnd of character
            queryStr += ');';

            sqlPool.getConnection(function(err, connection) {
                if (err) { reject(err); }
                connection.query(queryStr, function(error, results, fields) {
                    connection.release();
                    if (error) { throw error; }
                    console.log(`${(!PROD_MYSQL) ? '[TEST] ' : ''}MySQL: Insert Row into Table '${tableName}' with QUERY '${queryStr}' - Affected ${results.affectedRows} row(s).`);
                    resolve(results); 
                });
            });
        }
        catch (error) {
            console.error(`ERROR - insertMySQLQuery '${tableName}' Promise rejected.`);
            reject(error);
        }
    });
}

/**
 * MySQL query command
 * @param {string} queryString      Generic MySQL query in string format
 */
export const mySqlMakeQuery = (queryString) => {
    return new Promise(function(resolve, reject) {
        try {
            sqlPool.getConnection(function(err, connection) {
                if (err) { reject(err); }
                connection.query(queryString, function(error, results, fields) {
                    connection.release();
                    if (error) { reject(error); }
                    console.log(`${(!PROD_MYSQL) ? '[TEST] ' : ''}MySQL: Called query command '${queryStr}'`);
                    resolve(results[0]);
                })
            })
        }
        catch (error) {
            console.error("ERROR - makeQuery '" + queryString + "' Promise rejected.");
        }
    })
}
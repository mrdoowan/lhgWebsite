// Modularize the MySQL functions
module.exports = {
    insertQuery: insertMySQLQuery,
    callSProc: sProcMySqlQuery,
}

/*  Declaring MySQL npm modules */
const mysql = require('mysql'); // Interfacing with mysql DB
require('dotenv').config({ path: '../../.env' });

/*  Configurations of npm modules */
const sqlPool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.MYSQL_ENDPOINT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT, 
    database: process.env.MYSQL_DATABASE_STATS,
});

/*  'false' to test without affecting the databases. */
/*  'true' when comfortable changing MySQL db */
const CHANGE_MYSQL = process.env.CHANGE_DB || (process.env.NODE_ENV === 'production');
/*  Put 'false' to not debug. */
const DEBUG_MYSQL = false;

// DETAILED FUNCTION DESCRIPTION XD
function insertMySQLQuery(queryObject, tableName) {
    if (CHANGE_MYSQL) {
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
                        if (DEBUG_MYSQL) { console.log(`MySQL: Insert Row into Table '${tableName}' - Affected ${results.affectedRows} row(s).`); }
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
    else {
        // debugging
        if (DEBUG_MYSQL) { console.log(`DEBUG - MySQL Table '${tableName}` ); console.log(queryObject); }
    }
}

// DETAILED FUNCTION DESCRIPTION XD
function sProcMySqlQuery(sProcName) {
    let argArray = arguments; // Because arguments gets replaced by the function below
    return new Promise(function(resolve, reject) {
        try {
            let queryStr = "CALL " + sProcName + "(";
            for (let i = 1; i < argArray.length; ++i) {
                let arg = argArray[i];
                arg = (typeof arg === "string") ? '\'' + arg + '\'' : arg;
                queryStr += arg + ",";
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
                    console.log(`MySQL: Called SProc '${sProcName}' with params '${Array.from(argArray).slice(1)}'`);
                    if (results == null) { resolve({}); }
                    else { resolve(results[0]); } // Returns an Array of 'RowDataPacket'
                });
            });
        }
        catch (error) {
            console.error("ERROR - sProcMySqlQuery \'" + sProcName + "\' Promise rejected.");
            reject(error);
        }
    });
}
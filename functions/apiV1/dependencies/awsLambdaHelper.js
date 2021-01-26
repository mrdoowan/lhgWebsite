/*  Declaring AWS npm modules */
const AWS = require('aws-sdk'); // Interfacing with our AWS Lambda functions
/*  Configurations of npm modules */
AWS.config.update({ region: 'us-east-2' });
const lambda = new AWS.Lambda({ apiVersion: '2015-03-31' });

/**
 * (AWS Lambda function)
 * Calls Riot API and gets the Summoner ID of the summoner account
 * Returns the request object from Riot API
 * @param {string} name     Summoner IGN
 */
export const getRiotSummonerId = (name) => {
    return new Promise((resolve, reject) => {
        let params = {
            FunctionName: 'riotAPILambda',
            Payload: JSON.stringify({
                'type': "SUMMONER_DATA",
                'summonerName': name,
            }),
        };
        lambda.invoke(params, function(err, data) {
            if (err) { console.error(err); reject(err); return; }
            resolve(JSON.parse(data.Payload));
        });
    })
}

/**
 * (AWS Lambda function)
 * Calls Riot API and gets the Match Data of the input Match ID
 * Returns the request object of Match with items "Data" and "Timeline"
 * @param {string} matchId
 */
export const getRiotMatchData = (matchId) => {
    return new Promise((resolve, reject) => {
        let params = {
            FunctionName: 'riotAPILambda',
            Payload: JSON.stringify({
                'type': "MATCH_DATA",
                'matchId': matchId,
            }),
        };
        lambda.invoke(params, function(err, data) {
            if (err) { console.error(err); reject(err); return; }
            resolve(JSON.parse(data.Payload));
        });
    })
}

/**
 * (AWS Lambda function)
 * Calls Riot API and gets the Spectate Data of the input Summoner ID
 * Returns the request object of Spectate Request
 * @param {string} summonerId     Summoner ID
 */
export const getRiotSpectateData = (summonerId) => {
    return new Promise((resolve, reject) => {
        let params = {
            FunctionName: 'riotAPILambda',
            Payload: JSON.stringify({
                'type': "SPECTATE_DATA",
                'summonerId': summonerId,
            }),
        };
        lambda.invoke(params, function(err, data) {
            if (err) { console.error(err); reject(err); return; }
            resolve(JSON.parse(data.Payload));
        });
    })
}
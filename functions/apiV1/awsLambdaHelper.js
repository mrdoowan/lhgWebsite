// Modularize the AWS Lambda functions
module.exports = {
    getSummonerId: getSummonerIdLambda,
    getMatchData: getMatchDataLambda,
    postCurrentGame: postCurrentGameLambda,
}

/*  Declaring AWS npm modules */
var AWS = require('aws-sdk'); // Interfacing with our AWS Lambda functions
/*  Configurations of npm modules */
AWS.config.update({ region: 'us-east-2' });
var lambda = new AWS.Lambda({ apiVersion: '2015-03-31' });

function getSummonerIdLambda(name) {
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

function getMatchDataLambda(matchId) {
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

function postCurrentGameLambda(summonerId) {
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
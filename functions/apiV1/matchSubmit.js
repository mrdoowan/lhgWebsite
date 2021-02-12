// This function needs its own file because it is massive.

/*  Import dependency modules */
import { ChampById } from '../../client/src/static/ChampById';
import { getProfilePIdByName } from './profileData';

export const submitMatchSetup = (id) => {
    const BLUE = 'Blue';
    const RED = 'Red';

    return new Promise(async (resolve, reject) => {
        try {
            const matchDbObject = await dynamoDbGetItem('Matches', 'MatchPId', id);

            // Check if matchJson exists
            if (!matchDbObject) { 
                console.error(`Match ID ${matchId} does not exist.`);
                resolve(null);
                return;
            }
            // Check if there is a Setup property in matchJson
            if (!('Setup' in matchDbObject)) {
                console.error(`Match ID ${matchId} no longer has a Setup.`);
                resolve(null);
                return;
            }

            const setupDbObject = matchDbObject['Setup'];
            const validateList = [];
            // Check all the bans that they are actual champIds
            const checkBans = (color, banList) => {
                banList.forEach((banId, idx) => {
                    if (!(banId in ChampById)) {
                        validateList.push(
                            `${color} Team Bans of Id '${banId}' at index ${idx} is invalid.`
                        );
                    }
                });
            }
            checkBans(BLUE, setupDbObject.Teams.BlueTeam.Bans);
            checkBans(RED, setupDbObject.Teams.RedTeam.Bans);
            // Check if all profileNames exist in DynamoDb
            const checkProfiles = (color, playerList) => {
                playerList.forEach((player) => {
                    const profilePId = await getProfilePIdByName(player.ProfileName);
                    if (!profilePId) {
                        validateList.push(
                            `${color} Team Profile Name '${player.ProfileName}' does not exist in the database.`
                        );
                    }
                    else {
                        
                    }
                });
            }
            checkProfiles(BLUE, setupDbObject.Teams.BlueTeam.Players);
            checkProfiles(RED, setupDbObject.Teams.RedTeam.Players);
            // Check if both teamNames exist in DynamoDb
            const checkTeamName = (teamName) => {
                
            }

            // Check if the MySQL Db is available

            // Check validateList and resolve with validation errors

            // Transform data into object



            // Process object into databases
        }
        catch (error) {
            console.error(error); reject(error);
        }
    });
}
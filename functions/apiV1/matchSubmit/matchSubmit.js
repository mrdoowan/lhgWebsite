// This function needs its own file because it is massive.

/*  Import dependency modules */
import { createDbMatchObject } from './createMatchObject';
import { ChampById } from '../../../client/src/static/ChampById';
import { getProfilePIdByName } from '../profileData';
import { getTeamPIdByName } from '../teamData';
import { checkRdsStatus } from '../dependencies/awsRdsHelper';
import { dynamoDbGetItem, dynamoDbPutItem } from '../dependencies/dynamoDbHelper';
import { 
    AWS_RDS_STATUS,
    TEAM_STRING,
} from '../../../services/Constants';
import { mySqlInsertMatch } from './mySqlInsertMatch';

/**
 * Takes the Setup of matchId 
 * @param {string} id   matchId
 */
export const submitMatchSetup = (id) => {
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

            // Check validateList and resolve with validation errors
            const validateList = await validateSetupFormFields(matchDbObject.Setup.Teams);
            if (validateList.length > 0) {
                resolve({
                    error: 'Form fields from Match Setup are not valid.',
                    setupObject: matchDbObject.Setup,
                    validateMessages: validateList,
                });
                return;
            }
            
            // Create Db object for databases and push into MySQL and DynamoDb
            const newMatchDbObject = await createDbMatchObject(id, matchDbObject.Setup);
            await mySqlInsertMatch(newMatchDbObject, matchDbObject.Setup);
            await dynamoDbPutItem('Matches', newMatchDbObject, id);
            resolve(newMatchDbObject);
        }
        catch (error) {
            console.error(error); reject(error);
        }
    });
}

/**
 * 
 * @param {object} setupTeamsDbObject 
 */
function validateSetupFormFields(setupTeamsDbObject) {
    return new Promise(async (resolve, reject) => {
        try {
            const validateList = [];

            // Check all the bans that they are actual champIds
            const checkBans = async (color, banList) => {
                for (let i = 0; i < banList.length; ++i) {
                    const banId = banList[i];
                    if (!(banId in ChampById)) {
                        validateList.push(
                            `${color} Team Bans of Id '${banId}' at index ${i} is invalid.`
                        );
                    }
                }
            }
            await checkBans(TEAM_STRING.BLUE, setupTeamsDbObject.BlueTeam.Bans);
            await checkBans(TEAM_STRING.RED, setupTeamsDbObject.RedTeam.Bans);
            // Check if all profileNames exist in DynamoDb
            const checkProfiles = async (color, playerList) => {
                for (let i = 0; i < playerList.length; ++i) {
                    const playerObject = playerList[i];
                    const profilePId = await getProfilePIdByName(playerObject.ProfileName);
                    if (!profilePId) {
                        validateList.push(
                            `${color} Team Profile '${playerObject.ProfileName}' Name does not exist in database.`
                        );
                    }
                    else {
                        setupTeamsDbObject[`${color}Team`].Players[i].ProfilePId = profilePId;
                    }
                }
            }
            await checkProfiles(TEAM_STRING.BLUE, setupTeamsDbObject.BlueTeam.Players);
            await checkProfiles(TEAM_STRING.RED, setupTeamsDbObject.RedTeam.Players);
            // Check if both teamNames exist in DynamoDb
            const checkTeamName = async (color, teamName) => {
                const teamPId = await getTeamPIdByName(teamName);
                if (!teamPId) {
                    validateList.push(
                        `${color} Team '${teamName}' Name does not exist in database.`
                    );
                }
                else {
                    setupTeamsDbObject[`${color}Team`].TeamPId = teamPId;
                }
            }
            await checkTeamName(TEAM_STRING.BLUE, setupTeamsDbObject.BlueTeam.TeamName);
            await checkTeamName(TEAM_STRING.RED, setupTeamsDbObject.RedTeam.TeamName);
            // Check if the MySQL Db is available
            if ((await checkRdsStatus()) !== AWS_RDS_STATUS.AVAILABLE) {
                validateList.push(`MySQL Database is inactive. Start it first.`);
            }

            resolve(validateList);
        }
        catch (err) {
            reject(err);
        }
    })
    
}
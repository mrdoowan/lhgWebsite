// This function needs its own file because it is massive.

/*  Import dependency modules */
import { ChampById } from '../../client/src/static/ChampById';
import { checkRdsStatus } from './dependencies/awsRdsHelper';
import { getProfilePIdByName } from './profileData';
import { getTeamPIdByName } from './teamData';
import { AWS_RDS_STATUS } from '../../services/Constants';
const BLUE = 'Blue';
const RED = 'Red';

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
                    validateMessages: validateList,
                });
                return;
            }
            
            // Process object into databases

        }
        catch (error) {
            console.error(error); reject(error);
        }
    });
}

function validateSetupFormFields(setupTeamsDbObject) {
    return new Promise(async (resolve, reject) => {
        try {
            const validateList = [];

            // Check all the bans that they are actual champIds
            const checkBans = (color, banList) => {
                for (let i = 0; i < banList.length; ++i) {
                    const banId = banList[i];
                    if (!(banId in ChampById)) {
                        validateList.push(
                            `${color} Team Bans of Id '${banId}' at index ${idx} is invalid.`
                        );
                    }
                }
            }
            checkBans(BLUE, setupTeamsDbObject.BlueTeam.Bans);
            checkBans(RED, setupTeamsDbObject.RedTeam.Bans);
            // Check if all profileNames exist in DynamoDb
            const checkProfiles = async (color, playerList) => {
                for (let i = 0; i < playerList.length; ++i) {
                    const playerObject = playerList[i];
                    const profilePId = await getProfilePIdByName(playerObject.ProfileName);
                    if (!profilePId) {
                        validateList.push(
                            `${color} Team Profile '${player.ProfileName}' Name does not exist in database.`
                        );
                    }
                    else {
                        setupTeamsDbObject[`${color}Team`].Players[idx].ProfilePId = profilePId;
                    }
                }
            }
            checkProfiles(BLUE, setupTeamsDbObject.BlueTeam.Players);
            checkProfiles(RED, setupTeamsDbObject.RedTeam.Players);
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
            checkTeamName(BLUE, setupTeamsDbObject.BlueTeam.TeamName);
            checkTeamName(RED, setupTeamsDbObject.RedTeam.TeamName);
            // Check if the MySQL Db is available
            if ((await checkRdsStatus()) !== AWS_RDS_STATUS.AVAILABLE) {
                validateList.push(`
                    MySQL Database is inactive. Start it.
                `);
            }

            resolve(validateList);
        }
        catch (err) {
            reject(err);
        }
    });
}
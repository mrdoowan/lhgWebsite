// This function needs its own file because it is massive.

/*  Import dependency modules */


export const submitMatchSetup = (id) => {
    return new Promise((resolve, reject) => {
        const matchJson = await dynamoDbGetItem('Matches', 'MatchPId', id);

        // Check if matchJson exists

        // Check if there is a Setup property in matchJson

        const validateList = [];
        // Check all the bans are actual champIds

        // Check if all profileNames exist in DynamoDb

        // Check if both teamNames exist in DynamoDb


    }).catch((error) => { console.error(error); reject(error); });
}
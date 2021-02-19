/**
 * Gets the DDragon version of the LoL patch based on: https://ddragon.leagueoflegends.com/api/versions.json
 * @param {string} patch    Specified League of Legends patch (i.e. "10.23"). 'null' to get latest Patch
 */
export const getDDragonVersion = (patch=null) => {
    return new Promise((resolve, reject) => {
        axios.get(`https://ddragon.leagueoflegends.com/api/versions.json`)
        .then((res) => {
            const versionList = res.data;
            if (patch) {
                for (let i = 0; i < versionList.length; ++i) {
                    const DDragonVersion = versionList[i];
                    if (DDragonVersion.includes(patch)) {
                        resolve(DDragonVersion);
                    }
                }
            }
            resolve(DDragonVersion[0]); // Return latest as default
        }).catch((err) => {
            reject(err);
        });
    });
}
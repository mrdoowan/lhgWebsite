import axios from "axios";

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
                for (const DDragonVersion of versionList) {
                    if (DDragonVersion.includes(patch)) {
                        resolve(DDragonVersion);
                        return;
                    }
                }
            }
            else {
                resolve(versionList[0]);    // Return latest as default
            }
        }).catch((err) => {
            reject(err);
        });
    });
}
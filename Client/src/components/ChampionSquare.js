// npm modules
import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Static
const versions = require('../static/versions.json');
const champById = require('../static/champById.json');

const useStyles = makeStyles((theme) => ({
    table: {
        borderCollapse: 'collapse',
    },
    columnImage: {
        width: "25%",
        textAlign: 'right',
        padding: 0,
        margin: 0,
    },
    columnName: {
        width: "75%",
        textAlign: 'left',
        verticalAlign: 'middle',
        wordWrap: 'break-word',
        padding: 0,
        margin: 0,
    },
}));

// If version is blank, grab most recent version.
export default function ChampionSquare({ id, version='', withName=false}) {
    const classes = useStyles();

    let urlId = getChampUrlId(id);
    let name = getChampName(id);
    version = (version === '') ? getCurrentVersion() : version;
    let url = 'http://ddragon.leagueoflegends.com/cdn/' + version + '/img/champion/' + urlId + '.png';
    return (!withName) ? 
        (<img src={url} alt={urlId} width="30" height="30" />) :
        (<div><table className="table">
            <tbody>
                <tr>
                    <td className={classes.columnImage}><img src={url} alt={urlId} width="30" height="30" /></td>
                    <td className={classes.columnName}>{name}</td>
                </tr>
            </tbody>
            
        </table></div>);
}

function getChampUrlId(id) {
    if (!(id in champById)) {
        return id;
    }
    else {
        return champById[id]['id'];
    }
}

function getChampName(id) {
    if (!(id in champById)) {
        return id;
    }
    else {
        return champById[id]['name'];
    }
}

function getCurrentVersion() {
    return versions[0];
}
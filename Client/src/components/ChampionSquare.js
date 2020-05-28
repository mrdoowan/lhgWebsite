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
    columnImage1: {
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
        padding: 5,
        margin: 5,
    },
    columnImage2: {
        textAlign: 'center',
        padding: 0,
        margin: 0,
    },
    columnBan: {
        textAlign: 'center',
        padding: 0,
        margin: 0,
    },
}));

// If version is blank, grab most recent version.
export default function ChampionSquare({ id, version='', withName=false, withBans=false, bans=0 }) {
    const classes = useStyles();

    let urlId = getChampUrlId(id);
    let name = getChampName(id);
    version = (version === '') ? getCurrentVersion() : version;
    let url = 'http://ddragon.leagueoflegends.com/cdn/' + version + '/img/champion/' + urlId + '.png';
    let img = (<img src={url} alt={urlId} width="30" height="30" />);
    return (withName) ? (
            <div>
                <table className={classes.table}>
                    <tbody>
                        <tr>
                            <td className={classes.columnImage1}>{img}</td>
                            <td className={classes.columnName}>{name}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        ) ? (withBans) : (
            <div>
                <table className={classes.table}>
                    <tbody>
                        <tr>
                            <td className={classes.columnImage2}>{img}</td>
                        </tr>
                        <tr>
                            <td className={classes.columnBan}>{bans}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        ) : (
            {img}
        );
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
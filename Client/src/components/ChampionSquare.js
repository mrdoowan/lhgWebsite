// npm modules
import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Static
const versions = require('../static/versions.json');
const champById = require('../static/champById.json');

const useStyles = makeStyles((theme) => ({
    tableName: {
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
        padding: 5,
        margin: 5,
    },
    columnImgBan: {
        textAlign: 'center',
        padding: 0,
        margin: 0,
    },
    columnBan: {
        textAlign: 'center',
        padding: 0,
        margin: 0,
    },
    spacing: {
        padding: theme.spacing(0.25),
    }
}));

// If version is blank, grab most recent version.
export default function ChampionSquare({ id, version='', withName=false, withBans=false, bans=0 }) {
    const classes = useStyles();

    let urlId = getChampUrlId(id);
    let name = getChampName(id);
    version = (version === '') ? getCurrentVersion() : version;
    let url = 'http://ddragon.leagueoflegends.com/cdn/' + version + '/img/champion/' + urlId + '.png';

    // Had to put in Table because apparently a <img /> + string = "[Object object] + string". Like what
    return (withName) ? (
            <div>
                <table className={classes.tableName}>
                    <tbody>
                        <tr>
                            <td className={classes.columnImage}><img src={url} alt={urlId} width="30" height="30" /></td>
                            <td className={classes.columnName}>{name}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        ) : (withBans) ? (
            <div className={classes.spacing}>
                <img src={url} alt={urlId} width="30" height="30" /><br />
                {bans}
            </div>
        ) : (
            <img src={url} alt={urlId} width="30" height="30" />
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
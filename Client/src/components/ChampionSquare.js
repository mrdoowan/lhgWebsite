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
    },
    layoutChamps: {
        border: '1px solid black',
        width: '100%',
        alignItems: 'middle',
        justifyContent: 'middle',
        wordWrap: 'break-word',
        display: 'flex',
        flexWrap: 'wrap',
        padding: theme.spacing(1),
    },
}));

// If version is blank, grab most recent version.
export default function ChampionSquare({ id, version='', withName=false, vertical=false, num=0 }) {
    const classes = useStyles();

    let urlId = getChampUrlId(id);
    let name = getChampName(id);
    version = (version === '') ? getCurrentVersion() : version;
    let url = 'http://ddragon.leagueoflegends.com/cdn/' + version + '/img/champion/' + urlId + '.png';

    // Had to put in Table because apparently a <img /> + string = "[Object object] + string". Like what
    return (withName) ? (
        <div>
            <React.Fragment><img className={classes.spacing} src={url} alt={urlId} width="30" height="30" /> {name}</React.Fragment>
        </div>
    ) : (vertical) ? (
        <div className={classes.spacing}>
            <img className={classes.spacing} src={url} alt={urlId} width="30" height="30" /><br />
            {num}
        </div>
    ) : (
        <img className={classes.spacing} src={url} alt={urlId} width="30" height="30" />
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
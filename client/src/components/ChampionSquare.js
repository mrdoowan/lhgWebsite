// npm modules
import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Static
import { Versions } from '../static/Versions';
import { ChampById } from '../static/ChampById';

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

// If version is blank, grab most recent DDragon Version.
export default function ChampionSquare({ 
    id,
    patch=null,
    version=null,
    withName=false,
    vertical=false,
    num=0,
    width="30",
    height="30",
}) {
    const classes = useStyles();

    const urlId = getChampUrlId(id);
    const name = getChampName(id);
    const ddragonVersion = (!patch) ? 
        ((!version) ? getCurrentVersion() : version) : 
        getVersionByPatch(patch);
    let url = `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/${urlId}.png`;

    return (withName) ? (
        <div>
            <React.Fragment><img className={classes.spacing} src={url} alt={urlId} width={width} height={height} /> {name}</React.Fragment>
        </div>
    ) : (vertical) ? (
        <div className={classes.spacing}>
            <img className={classes.spacing} src={url} alt={urlId} width={width} height={height} /><br />
            {num}
        </div>
    ) : (
        <img className={classes.spacing} src={url} alt={urlId} width={width} height={height} />
    );
}

function getChampUrlId(id) {
    if (!(id in ChampById)) {
        return id;
    }
    else {
        return ChampById[id]['id'];
    }
}

function getChampName(id) {
    if (!(id in ChampById)) {
        return id;
    }
    else {
        return ChampById[id]['name'];
    }
}

function getCurrentVersion() {
    return Versions[0];
}

function getVersionByPatch(patch) {
    if (patch) {
        for (const DDragonVersion of Versions) {
            if (DDragonVersion.includes(patch)) {
                return DDragonVersion;
            }
        }
    }
    return Versions[0]; // Default latest patch
}
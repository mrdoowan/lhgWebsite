// npm modules
import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Static
import { Versions } from '../static/Versions';
import NoImage from '../no-image.png';

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
export default function ItemSquare({
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

    const ddragonVersion = (!patch) ?
        ((!version) ? getCurrentVersion() : version) :
        getVersionByPatch(patch);

    // since we can get itemIds that = 0, we want to render a blank square
    if (id === 0) {
        return (
            <img src={NoImage} className={classes.spacing} alt={id} width={width} height={height} />
        );
    }
    else {
        const url = `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/item/${id}.png`;

        return (withName) ? (
            <div>
                <React.Fragment><img className={classes.spacing} src={url} alt={id} width={width} height={height} />ITEMNAME</React.Fragment>
            </div>
        ) : (vertical) ? (
            <div className={classes.spacing}>
                <img className={classes.spacing} src={url} alt={id} width={width} height={height} /><br />
                {num}
            </div>
        ) : (
            <img className={classes.spacing} src={url} alt={id} width={width} height={height} />
        );
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

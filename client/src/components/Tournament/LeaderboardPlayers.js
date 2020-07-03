import React from 'react';
import { Link } from 'react-router-dom';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// Component
import ChampionSquare from '../ChampionSquare';
// Util
const lhgString = require('../../util/StringHelper');

const useStyles = makeStyles((theme) => ({
    paper: {
        height: "100%",
        padding: theme.spacing(1),
        display: "flex",
        flexDirection: "column",
        justifyContent: "top",
        color: theme.palette.text.primary,
        background: '#A9A9A9',
    },
    titleOutside: {
        fontWeight: 'bold',
        textDecoration: 'underline',
        padding: theme.spacing(2),
        fontSize: 'x-large',
    },
    titlePaper: {
        fontWeight: 'bold',
        textDecoration: 'underline',
        padding: theme.spacing(2),
        fontSize: 'large',
    },
    columnImage: {
        width: "5%",
        textAlign: 'right',
    },
    columnName: {
        width: "30%",
        textAlign: 'left',
        verticalAlign: 'middle',
        wordWrap: 'break-word',
        paddingBottom: '5px',
    },
    columnData: {
        width: "65%",
        padding: '5px 20px 5px 20px',
        textAlign: 'left',
        wordWrap: 'break-word',
        paddingBottom: '10px',
    },
    row: {
        padding: theme.spacing(1),
    },
    link: {
        color: 'blue',
    },
}));

export default function LeaderboardPlayers({ playerRecords }) {
    const classes = useStyles();
    const titles = {
        'PlayerMostDamage': "Highest Damage Dealt",
        'PlayerMostFarm': "Highest Farming Rate",
        'PlayerMostGoldDiffEarly': "Highest Gold Diff @15",
        'PlayerMostXpDiffEarly': "Highest XP Diff @15",
        'PlayerMostVision': "Highest Vision",
    }

    return (
        <div>
            <div className={classes.titleOutside}>Player Leaderboards</div>
            <Grid container spacing={3}>
                {Object.keys(playerRecords).map((recordType) => (
                    <Grid key={recordType} item xs={6}>
                        <Paper className={classes.paper}>
                            <div className={classes.titlePaper}>{titles[recordType]}</div>
                            <table>
                                <tbody>
                                {playerRecords[recordType].map((item, i) => (
                                    <tr key={i} className={classes.row}>
                                        <td className={classes.columnImage}>
                                            <ChampionSquare patch={item.Patch} id={item.ChampId} />
                                        </td>
                                        <td className={classes.columnName}>
                                            {thisTeam(item, classes)}
                                            &nbsp;<Link className={classes.link} to={`/profile/${item.ProfileName}`}>{item.ProfileName}</Link>
                                        </td>
                                        <td className={classes.columnData}>
                                            {recordString(recordType, item)} {enemyTeam(item, classes)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </div>
    )
}

/**
 * Returns leaderboard description type of stat
 * @param {string} type     Type of leaderboard
 * @param {object} item     Data containing the MySql row
 */
function recordString(type, item) {
    switch (type) {
        case 'PlayerMostDamage':
            return item.DamagePerMin.toFixed(2) + ' DPM - ' + item.DamageDealt + ' in ' + lhgString.time(item.GameDuration);
        case 'PlayerMostFarm':
            return item.CsPerMin.toFixed(2) + ' CSPM - ' + item.CreepScore + ' in ' + lhgString.time(item.GameDuration);
        case 'PlayerMostGoldDiffEarly':
            return '+' + item.GDiffEarly + ' GD@15 - ' + item.GAtEarly + ' Gold';
        case 'PlayerMostXpDiffEarly':
            return '+' + item.XpDiffEarly + ' XPD@15 - ' + item.XpAtEarly + ' XP';
        case 'PlayerMostVision':
            return item.VsPerMin.toFixed(2) + ' VSPM - ' + item.VisionScore + ' in ' + lhgString.time(item.GameDuration);
        default:
            return '';
    }
}

/**
 * Returns JSX element of the player's team in following format: [TSM]
 * @param {object} item     Data containing the MySql row
 * @param {object} classes  Material-UI styles
 */
function thisTeam(item, classes) {
    let teamName = (item.Side === 'Blue') ? item.BlueTeamName :
        (item.Side === 'Red') ? item.RedTeamName : null;
    let shortName = (item.Side === 'Blue') ? item.BlueTeamShortName : 
        (item.Side === 'Red') ? item.RedTeamShortName : null;
    
    return (<React.Fragment>[<Link className={classes.link} to={`/team/${teamName}`}>{shortName}</Link>]</React.Fragment>);
}

/**
 * Returns JSX element of enemy team in the following format: (vs. C9)
 * @param {object} item     Data containing the MySql row
 * @param {object} classes  Material-UI styles
 */
function enemyTeam(item, classes) {
    let shortName = (item.Side === 'Blue') ? item.RedTeamShortName : 
        (item.Side === 'Red') ? item.BlueTeamShortName : null;

    return (<React.Fragment>(<Link className={classes.link} to={`/match/${item.MatchPId}`}>vs. {shortName}</Link>)</React.Fragment>);
}
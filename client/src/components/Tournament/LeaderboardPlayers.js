import React from 'react';
import { Link } from 'react-router-dom';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// Component
import ChampionSquare from '../ChampionSquare';
// Util
import { getTimeString } from '../../util/StringHelper';

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
    columnNum: {
        width: "3%",
        textAlign: 'right',
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
        width: "62%",
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
    };

    /**
     * Returns leaderboard description type of stat
     * @param {string} type     Type of leaderboard
     * @param {object} item     Data containing the MySql row
     */
    const recordString = (type, item) => {
        switch (type) {
            case 'PlayerMostDamage':
                return (<React.Fragment><b>{item.DamagePerMin.toFixed(2).toLocaleString()} DPM</b> - {item.DamageDealt.toLocaleString()} in {getTimeString(item.GameDuration)}</React.Fragment>);
            case 'PlayerMostFarm':
                return (<React.Fragment><b>{item.CsPerMin.toFixed(2)} CSPM</b> - {item.CreepScore} in {getTimeString(item.GameDuration)}</React.Fragment>);
            case 'PlayerMostGoldDiffEarly':
                return (<React.Fragment><b>+{item.GDiffEarly.toLocaleString()} GD@15</b> - {item.GAtEarly.toLocaleString()} Gold</React.Fragment>);
            case 'PlayerMostXpDiffEarly':
                return (<React.Fragment><b>+{item.XpDiffEarly.toLocaleString()} XPD@15</b> - {item.XpAtEarly.toLocaleString()} XP</React.Fragment>);
            case 'PlayerMostVision':
                return (<React.Fragment><b>{item.VsPerMin.toFixed(2)} VSPM</b> - {item.VisionScore} in {getTimeString(item.GameDuration)}</React.Fragment>);
            default:
                return '';
        }
    }

    /**
     * Returns JSX element of the player's team in following format: [TSM]
     * @param {object} item     Data containing the MySql row
     * @param {object} classes  Material-UI styles
     */
    const thisTeam = (item, classes) => {
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
    const enemyTeam = (item, classes) => {
        let shortName = (item.Side === 'Blue') ? item.RedTeamShortName : 
            (item.Side === 'Red') ? item.BlueTeamShortName : null;

        return (<React.Fragment>(<Link className={classes.link} to={`/match/${item.MatchPId}`}>vs. {shortName}</Link>)</React.Fragment>);
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
                                        <td className={classes.columnNum}>
                                            {i + 1})
                                        </td>
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
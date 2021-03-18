import React from 'react';
import { Link } from 'react-router-dom';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// Components
import ChampionSquare from '../ChampionSquare';
import Dragdown from '../Dragdown';
// Util
import {
    getTimeString,
    getDateString
} from '../../util/StringHelper';

const useStyles = makeStyles((theme) => ({
    paper: {
        height: "100%",
        padding: theme.spacing(2),
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        color: theme.palette.text.primary,
        background: '#BEBEBE',
    },
    title: {
        marginTop: theme.spacing(2),
        fontWeight: 'bold',
        fontSize: 'large',
    },
    colTitle: {
        width: "80%",
        textAlign: 'left',
        fontSize: 'x-large',
    },
    colDragdown: {
        width: "20%",
        textAlign: 'right',
    },
    rowBorder: {
        padding: theme.spacing(5),
        border: '1px solid black',
        fontSize: 'small',
    },
    rowWin: {
        padding: theme.spacing(5),
        border: '1px solid black',
        backgroundColor: '#BDE7BD', // Green
    },
    rowLose: {
        padding: theme.spacing(5),
        border: '1px solid black',
        backgroundColor: '#FFB6B3', // Red
    },
    rowInvalid: {
        padding: theme.spacing(5),
        border: '1px solid black',
        backgroundColor: '#aaaaaa', // Gray
    },
    leftHeader: {
        textAlign: 'left',
        fontWeight: 'bold',
        textDecoration: 'underline',
        padding: theme.spacing(1),
    },
    midHeader: {
        textAlign: 'middle',
        textDecoration: 'underline',
        fontWeight: 'bold',
        padding: theme.spacing(1),
    },
    colDate: {
        width: "10%",
        textAlign: 'left',
        padding: theme.spacing(1),
    },
    colTeams: {
        width: "15%",
        textAlign: 'left',
        padding: theme.spacing(1),
    },
    colChamp: {
        width: "12%",
        textAlign: 'middle',
        padding: theme.spacing(1),
    },
    colKda: {
        width: "10%",
        textAlign: 'middle',
        fontSize: 'small',
        padding: theme.spacing(1),
    },
    colOverallSpan: {
        width: "23%",
        textAlign: 'middle',
        fontSize: 'small',
        padding: theme.spacing(1),
    },
    colDiffSpan: {
        width: "30%",
        textAlign: 'right',
        fontSize: 'small',
        padding: theme.spacing(1),
    },
    // Tables within Overall
    colOverallTotal: {
        width: "40%",
        textAlign: 'right',
        paddingRight: theme.spacing(0.5),
    },
    colOverallPerMin: {
        width: "20%",
        textAlign: 'middle',
        paddingLeft: theme.spacing(0.5),
        paddingRight: theme.spacing(0.5),
    },
    colOverallPct: {
        width: "40%",
        textAlign: 'left',
        paddingLeft: theme.spacing(0.5),
    },
    // Tables within Diff
    colDiffValue15: {
        width: "34%",
        textAlign: 'right',
        paddingRight: theme.spacing(0.5),
    },
    colDiffText15: {
        width: "10%",
        textAlign: 'right',
        paddingLeft: theme.spacing(0.5),
        paddingRight: theme.spacing(0.5),
    },
    colDiffArrow: {
        width: "8%",
        textAlign: 'middle',
        paddingRight: theme.spacing(1),
    },
    colDiffText25: {
        width: "10%",
        textAlign: 'left',
        paddingLeft: theme.spacing(0.5),
        paddingRight: theme.spacing(0.5),
    },
    colDiffValue25: {
        width: "34%",
        textAlign: 'left',
        paddingLeft: theme.spacing(0.5),
    },
    // Misc
    tableNested: {
        width: "100%",
        display: 'table',
    },
    link: {
        color: 'darkBlue',
    },
    seasonLink: {
        color: 'blue',
    },
    blueSide: {
        color: 'blue',
        textShadow: '-0.5px -0.5px 0 #000, 0.5px -0.5px 0 #000, -0.5px 0.5px 0 #000, 0.5px 0.5px 0 #000',
        display: 'inline',
    },
    redSide: {
        color: 'red',
        textShadow: '-0.5px -0.5px 0 #000, 0.5px -0.5px 0 #000, -0.5px 0.5px 0 #000, 0.5px 0.5px 0 #000',
        display: 'inline',
    },
}));

export default function ProfileGames({ info, games }) {
    const classes = useStyles();
    const { Matches } = games;

    return (<div>
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper className={classes.paper}>
                    <table>
                        <tbody>
                            <tr>
                                <td className={classes.colTitle}>
                                    <Link to={`/season/${games.SeasonShortName}`} className={classes.seasonLink}><b>{games.SeasonName} Season</b></Link>
                                </td>
                                <td className={classes.colDragdown}>
                                <Dragdown 
                                    list={info.SeasonList} 
                                    basePath={`/profile/${info.ProfileName}/games`}
                                    type="Teams"
                                    title={games.SeasonTime}
                                />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <br />
                    <table>
                        <thead>
                            <tr className={classes.rowBorder}>
                                <td className={classes.leftHeader}>Date</td>
                                <td className={classes.leftHeader}>Team</td>
                                <td className={classes.midHeader}>Champion</td>
                                <td className={classes.midHeader}>KDA</td>
                                <td className={classes.midHeader}>Overall Stats</td>
                                <td className={classes.midHeader}>Differentials</td>
                            </tr>
                        </thead>
                        <tbody>{Object.keys(Matches).sort((a,b) => { return Matches[b].DatePlayed - Matches[a].DatePlayed; }).map((matchId) => {
                            const match = Matches[matchId];

                            return (<tr key={matchId} className={(match.Invalid) ? classes.rowInvalid : 
                                (match.Win) ? classes.rowWin : 
                                classes.rowLose}>
                                <td className={classes.colDate}>
                                    <Link to={`/match/${matchId}`} className={classes.link}>{getDateString(match.DatePlayed / 1000)}</Link><br />
                                    {match.TournamentType}<br />
                                    ({getTimeString(match.GameDuration)})<br />
                                </td>
                                <td className={classes.colTeams}>
                                    <Link to={`/team/${match.TeamName}/games/${games.SeasonShortName}`} className={classes.link}>{match.TeamName}</Link> [{sideString(match.Side, classes)}]<br />
                                    (vs. <Link to={`/team/${match.EnemyTeamName}/games/${games.SeasonShortName}`} className={classes.link}>{match.EnemyTeamName}</Link>)
                                </td>
                                <td className={classes.colChamp}>
                                    <ChampionSquare id={match.ChampionPlayed} width="70" height="70" />
                                </td>
                                <td className={classes.colKda}>
                                    <b><u>{match.Role}</u></b><br />
                                    <b>{match.Kills} / {match.Deaths} / {match.Assists}</b><br />
                                    <b>{match.Kda}</b> KDA<br />
                                    <b>{pctString(match.KillPct)}%</b> K/P
                                </td>
                                <td className={classes.colOverallSpan}>
                                    <table className={classes.tableNested}>
                                        <tbody>
                                            <tr className="creepScore">
                                                <td className={classes.colOverallTotal}>{match.CreepScore}</td>
                                                <td className={classes.colOverallPerMin}>(<b>{match.CreepScorePerMinute}</b>)</td>
                                                <td className={classes.colOverallPct}>CS</td>
                                            </tr>
                                            <tr className="Gold">
                                                <td className={classes.colOverallTotal}>{match.Gold.toLocaleString()}</td>
                                                <td className={classes.colOverallPerMin}>(<b>{match.GoldPerMinute}</b>)</td>
                                                <td className={classes.colOverallPct}>GOLD [<b>{pctString(match.GoldPct)}%</b>]</td>
                                            </tr>
                                            <tr className="Damage">
                                                <td className={classes.colOverallTotal}>{match.DamageDealt.toLocaleString()}</td>
                                                <td className={classes.colOverallPerMin}>(<b>{match.DamagePerMinute}</b>)</td>
                                                <td className={classes.colOverallPct}>DMG [<b>{pctString(match.DamagePct)}%</b>]</td>
                                            </tr>
                                            <tr className="Vision Score">
                                                <td className={classes.colOverallTotal}>{match.VisionScore}</td>
                                                <td className={classes.colOverallPerMin}>(<b>{match.VisionScorePerMinute}</b>)</td>
                                                <td className={classes.colOverallPct}>VS [<b>{pctString(match.VisionScorePct)}%</b>]</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                                <td className={classes.colDiffSpan}>
                                    <table className={classes.tableNested}>
                                        <tbody>
                                            <tr className="CsDiff">
                                                <td className={classes.colDiffValue15}>{diffValueString(match.CsAtEarly, match.CsDiffEarly, 15)}</td>
                                                <td className={classes.colDiffText15}>CSD@15</td>
                                                <td className={classes.colDiffArrow}>{`→`}</td>
                                                <td className={classes.colDiffText25}>CSD@25</td>
                                                <td className={classes.colDiffValue25}>{diffValueString(match.CsAtMid, match.CsDiffMid, 25)}</td>
                                            </tr>
                                            <tr className="GoldDiff">
                                                <td className={classes.colDiffValue15}>{diffValueString(match.GoldAtEarly, match.GoldDiffEarly, 15)}</td>
                                                <td className={classes.colDiffText15}>GD@15</td>
                                                <td className={classes.colDiffArrow}>{`→`}</td>
                                                <td className={classes.colDiffText25}>GD@25</td>
                                                <td className={classes.colDiffValue25}>{diffValueString(match.GoldAtMid, match.GoldDiffMid, 25)}</td>
                                            </tr>
                                            <tr className="XpDiff">
                                                <td className={classes.colDiffValue15}>{diffValueString(match.XpAtEarly, match.XpDiffEarly, 15)}</td>
                                                <td className={classes.colDiffText15}>XPD@15</td>
                                                <td className={classes.colDiffArrow}>{`→`}</td>
                                                <td className={classes.colDiffText25}>XPD@25</td>
                                                <td className={classes.colDiffValue25}>{diffValueString(match.XpAtMid, match.XpDiffMid, 25)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>)
                        })}</tbody>
                    </table>
                </Paper>
            </Grid>
        </Grid>
    </div>);
}

/**
 * String format of the differential value. (i.e. '+1,000', '-1,500')
 * @param {number} diff     Differential stat value
 */
function diffString(diff) {
    return (diff != null) ? (<React.Fragment><b>{(diff > 0) ? '+' : ''}{diff.toLocaleString()}</b></React.Fragment>) : '';
}

/**
 * String format of Diff + At values.
 * 15th minute is structured as "AT (<b>DIFF</b>)"
 * 25th minute is structured as "(<b>DIFF</b>) AT"
 * @param {number} at       At minute value (used as a null check)
 * @param {number} diff     Differential value (used as a null check)
 * @param {number} min      Minute value ('15' or '25')
 */
function diffValueString(at, diff, min) {
    return (at != null && diff != null) ? (
        (min === 15) ? (<React.Fragment>{at.toLocaleString()} (<b>{diffString(diff)}</b>)</React.Fragment>) : 
        (min === 25) ? (<React.Fragment>(<b>{diffString(diff)}</b>) {at.toLocaleString()}</React.Fragment>) : 
        ''
    ) : '';
}

/**
 * Converts <1 value to a percentage and rounds to nearest number (i.e. 75%) 
 * @param {number} pct  A value normally with fixed at 4 decimal places
 */
function pctString(pct) {
    return Math.round(pct * 100);
}

/**
 * Returns JSX element of the side the Team played on
 * @param {*} side 
 * @param {*} classes 
 */
function sideString(side, classes) {
    return (side === 'Blue') ? (<div className={classes.blueSide}>B</div>) : (side === 'Red') ? (<div className={classes.redSide}>R</div>) : '';
}
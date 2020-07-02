import React from 'react';
import { Link } from 'react-router-dom';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
// Components
import ChampionSquare from '../ChampionSquare';
// Util
const lhgString = require('../../util/StringHelper');

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
        padding: theme.spacing(2),
        fontWeight: 'bold',
        fontSize: 'large',
    },
    rowBorder: {
        padding: theme.spacing(5),
        border: '1px solid black',
        fontSize: 'small',
    },
    rowWin: {
        padding: theme.spacing(5),
        border: '1px solid black',
        fontSize: 'small',
        backgroundColor: '#90EE90',
    },
    rowLose: {
        padding: theme.spacing(5),
        border: '1px solid black',
        fontSize: 'small',
        backgroundColor: '#FF7F7F',
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
        width: "8%",
        textAlign: 'left',
        padding: theme.spacing(1),
    },
    colEnemy: {
        width: "12%",
        textAlign: 'left',
        padding: theme.spacing(1),
    },
    colTime: {
        width: "5%",
        textAlign: 'center',
        padding: theme.spacing(1),
    },
    colStats: {
        width: "10%",
        textAlign: 'center',
        padding: theme.spacing(1),
    },
    colTop: {
        width: "9%",
        textAlign: 'center',
        padding: theme.spacing(1),
    },
    colJng: {
        width: "9%",
        textAlign: 'center',
        padding: theme.spacing(1),
    },
    colMid: {
        width: "9%",
        textAlign: 'center',
        padding: theme.spacing(1),
    },
    colBot: {
        width: "9%",
        textAlign: 'center',
        padding: theme.spacing(1),
    },
    colSup: {
        width: "9%",
        textAlign: 'center',
        padding: theme.spacing(1),
    },
    colBansAgainst: {
        width: "20%",
        textAlign: 'center',
        padding: theme.spacing(1),
    },
    layoutChamps: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        wordWrap: 'break-word',
        display: 'flex',
        flexWrap: 'wrap',
        padding: theme.spacing(1),
    },
    link: {
        color: 'darkBlue',
    },
}));

export default function TeamGameLog({ games }) {
    const classes = useStyles();
    const { Matches } = games;

    return (
        <Paper variant="outlined" square className={classes.paper}>
            <table>
                <thead>
                    <tr className={classes.rowBorder}>
                        <td className={classes.leftHeader}>Date</td>
                        <td className={classes.leftHeader}>Opponent</td>
                        <td className={classes.midHeader}>Duration</td>
                        <td className={classes.midHeader}>Team Stats</td>
                        <td className={classes.midHeader}>Top</td>
                        <td className={classes.midHeader}>Jungle</td>
                        <td className={classes.midHeader}>Middle</td>
                        <td className={classes.midHeader}>Bottom</td>
                        <td className={classes.midHeader}>Support</td>
                        <td className={classes.midHeader}>Bans Against Team</td>
                    </tr>
                </thead>
                <tbody>
                {Object.keys(Matches).sort((a,b) => { return Matches[b].DatePlayed - Matches[a].DatePlayed; }).map((Id) => {
                    const match = Matches[Id];
                    const { ChampPicks: { Top, Jungle, Middle, Bottom, Support } } = match;
                    const { BannedAgainst } = match;

                    return (
                        <tr key={Id} className={(match.Win) ? classes.rowWin : classes.rowLose}>
                            <td className={classes.colDate}>
                                <Link to={`/match/${Id}`} className={classes.link}>{lhgString.date(match.DatePlayed / 1000)}</Link><br />
                                {match.TournamentType}
                            </td>
                            <td className={classes.colEnemy}>
                                vs. <a href={`/team/${match.EnemyTeamName}/games/${games.SeasonShortName}`} className={classes.link}>{match.EnemyTeamName}</a>
                                {/* https://stackoverflow.com/questions/43087007/react-link-vs-a-tag-and-arrow-function On why we use <a> instead of <Link> */}
                            </td>
                            <td className={classes.colTime}>
                                {lhgString.time(match.GameDuration)}
                            </td>
                            <td className={classes.colStats}>
                                <b>{match.Kills} / {match.Deaths} / {match.Assists}</b><br />
                                <b>{match.GoldPerMinute}</b> GPM<br />
                                {goldString(match.GoldDiffEarly, 'GD@15')}
                                {goldString(match.GoldDiffMid, 'GD@25')}
                            </td>
                            <td className={classes.colTop}>
                                {playerCell(Top, games.SeasonShortName, classes)}
                            </td>
                            <td className={classes.colJng}>
                                {playerCell(Jungle, games.SeasonShortName, classes)}
                            </td>
                            <td className={classes.colMid}>
                                {playerCell(Middle, games.SeasonShortName, classes)}
                            </td>
                            <td className={classes.colBot}>
                                {playerCell(Bottom, games.SeasonShortName, classes)}
                            </td>
                            <td className={classes.colSup}>
                                {playerCell(Support, games.SeasonShortName, classes)}
                            </td>
                            <td className={classes.colBansAgainst}>
                                <div className={classes.layoutChamps}>
                                    {BannedAgainst.map((Id) => (<ChampionSquare key={Id} id={Id} />))}
                                </div>
                            </td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
        </Paper>
    )
}

/**
 * Displays Gold as i.e. '+1000' or '-1000'.
 * @param {number} gold     If gold is null, return ''.
 * @param {string} label    'GD15' or 'GD25'
 */
function goldString(gold, label) {
    return (gold) ? (<React.Fragment><b>{(gold > 0) ? '+' : ''}{gold}</b> {label}<br /></React.Fragment>) : '';
}

/**
 * Returns a JSX Element of a Player's profile
 * @param {object} playerObject     From ChampPicks in Team's GameLog
 * @param {object} seasonShortName  Code of season
 * @param {object} classes          Material-ui styles
 */
function playerCell(playerObject, seasonShortName, classes) {
    return (
        <div>
            <ChampionSquare id={playerObject.ChampId} /><br />
            <Link to={`/profile/${playerObject.ProfileName}/games/${seasonShortName}`} className={classes.link}>{playerObject.ProfileName}</Link><br />
            <b>{playerObject.PlayerKills} / {playerObject.PlayerDeaths} / {playerObject.PlayerAssists}</b><br />
            {goldString(playerObject.PlayerGoldDiffEarly, 'GD@15')}
            {goldString(playerObject.PlayerGoldDiffMid, 'GD@25')}
        </div>
    );
}
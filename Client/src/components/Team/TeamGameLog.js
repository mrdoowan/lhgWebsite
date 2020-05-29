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
    midHeader: {
        textAlign: 'middle',
        fontWeight: 'bold',
    },
    leftHeader: {
        textAlign: 'left',
        fontWeight: 'bold',
    },
    colDate: {
        width: "8%",
        textAlign: 'left',
    },
    colEnemy: {
        width: "12%",
        textAlign: 'left',
    },
    colTime: {
        width: "5%",
        textAlign: 'left',
    },
    colStats: {
        width: "15%",
        textAlign: 'center',
    },
    colTop: {
        width: "7%",
        textAlign: 'center',
    },
    colJng: {
        width: "7%",
        textAlign: 'center',
    },
    colMid: {
        width: "7%",
        textAlign: 'center',
    },
    colBot: {
        width: "7%",
        textAlign: 'center',
    },
    colSup: {
        width: "7%",
        textAlign: 'center',
    },
    colBansAgainst: {
        width: "25%",
        textAlign: 'center',
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
                        <td className={classes.midHeader}>Date</td>
                        <td className={classes.midHeader}>Team</td>
                        <td className={classes.leftHeader}>Duration</td>
                        <td className={classes.midHeader}>Stats</td>
                        <td className={classes.midHeader}></td>
                        <td className={classes.midHeader}></td>
                        <td className={classes.midHeader}>Champs</td>
                        <td className={classes.midHeader}></td>
                        <td className={classes.midHeader}></td>
                        <td className={classes.midHeader}>Bans Against Team</td>
                    </tr>
                </thead>
                <tbody>
                {Object.keys(Matches).sort((a,b) => { return Matches[a].DatePlayed - Matches[b].DatePlayed; }).map((Id) => {
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
                                vs. <Link to={`/team/${match.EnemyTeamName}/games/${games.SeasonShortName}`} className={classes.link}>{match.EnemyTeamName}</Link>
                            </td>
                            <td className={classes.colTime}>
                                {lhgString.time(match.GameDuration)}
                            </td>
                            <td className={classes.colStats}>
                                <b>{match.Kills} / {match.Deaths} / {match.Assists}</b><br />
                                <b>{match.GoldPerMinute}</b> GPM<br />
                                {(match.GoldDiffEarly) ? (<React.Fragment><b>{match.GoldDiffEarly}</b> GD@15</React.Fragment>) : ''}<br />
                                {(match.GoldDiffMid) ? (<React.Fragment><b>{match.GoldDiffMid}</b> GD@25</React.Fragment>) : ''}<br />
                            </td>
                            <td className={classes.colTop}>
                                <ChampionSquare id={Top.ChampId} /><br />
                                <Link to={`/profile/${Top.ProfileName}/games/${games.SeasonShortName}`} className={classes.link}>{Top.ProfileName}</Link>
                            </td>
                            <td className={classes.colJng}>
                                <ChampionSquare id={Jungle.ChampId} /><br />
                                <Link to={`/profile/${Jungle.ProfileName}/games/${games.SeasonShortName}`} className={classes.link}>{Jungle.ProfileName}</Link>
                            </td>
                            <td className={classes.colMid}>
                                <ChampionSquare id={Middle.ChampId} /><br />
                                <Link to={`/profile/${Middle.ProfileName}/games/${games.SeasonShortName}`} className={classes.link}>{Middle.ProfileName}</Link>
                            </td>
                            <td className={classes.colBot}>
                                <ChampionSquare id={Bottom.ChampId} /><br />
                                <Link to={`/profile/${Bottom.ProfileName}/games/${games.SeasonShortName}`} className={classes.link}>{Bottom.ProfileName}</Link>
                            </td>
                            <td className={classes.colSup}>
                                <ChampionSquare id={Support.ChampId} /><br />
                                <Link to={`/profile/${Support.ProfileName}/games/${games.SeasonShortName}`} className={classes.link}>{Support.ProfileName}</Link>
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
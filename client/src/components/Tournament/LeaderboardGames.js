import React from 'react';
import { Link } from 'react-router-dom';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// Util
import {
    getTimeString,
    getDateString
} from '../../util/StringHelper';

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
        padding: theme.spacing(2),
        textDecoration: 'underline',
        fontSize: 'large',
    },
    link: {
        color: 'blue',
    }
}));

export default function LeaderboardGames({ gameRecords }) {
    const classes = useStyles();
    const { ShortestGame, LongestGame, MostKillGame } = gameRecords;

    return (
        <div>
            <div className={classes.titleOutside}>Game Leaderboards</div>
            <Grid container spacing={3}>
                <Grid item xs={4}>
                    <Paper className={classes.paper}>
                        <div className={classes.titlePaper}>Shortest Game</div>
                        <p>
                            <Link className={classes.link} to={`/team/${ShortestGame.BlueTeamName}`}>{ShortestGame.BlueTeamName}</Link>
                            &nbsp;vs.&nbsp;
                            <Link className={classes.link} to={`/team/${ShortestGame.RedTeamName}`}>{ShortestGame.RedTeamName}</Link>
                            &nbsp;- <Link className={classes.link} to={`/match/${ShortestGame.MatchPId}`}>{getTimeString(ShortestGame.GameDuration)}</Link>
                        </p>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <Paper className={classes.paper}>
                        <div className={classes.titlePaper}>Longest Game</div>
                        <p>
                            <Link className={classes.link} to={`/team/${LongestGame.BlueTeamName}`}>{LongestGame.BlueTeamName}</Link>
                            &nbsp;vs.&nbsp;
                            <Link className={classes.link} to={`/team/${LongestGame.RedTeamName}`}>{LongestGame.RedTeamName}</Link>
                            &nbsp;- <Link className={classes.link} to={`/match/${LongestGame.MatchPId}`}>{getTimeString(LongestGame.GameDuration)}</Link>
                        </p>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <Paper className={classes.paper}>
                        <div className={classes.titlePaper}>Bloodiest Game</div>
                        <p>
                            <Link className={classes.link} to={`/team/${MostKillGame.BlueTeamName}`}>{MostKillGame.BlueTeamName}</Link>
                            &nbsp;vs.&nbsp;
                            <Link className={classes.link} to={`/team/${MostKillGame.RedTeamName}`}>{MostKillGame.RedTeamName}</Link>
                            &nbsp;- <Link className={classes.link} to={`/match/${MostKillGame.MatchPId}`}>{MostKillGame.Kills} Kills</Link>
                        </p>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    )
}
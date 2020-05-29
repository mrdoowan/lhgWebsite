import React from 'react';
import { Link } from 'react-router-dom';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// Util
const lhgString = require('../../util/StringHelper');

const useStyles = makeStyles((theme) => ({
    paper: {
        height: "100%",
        padding: theme.spacing(1),
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        color: theme.palette.text.primary,
        background: '#A9A9A9',
    },
    title: {
        padding: theme.spacing(2),
        'text-decoration': 'underline',
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
            <p className={classes.title}>Game Leaderboards</p>
            <Grid container spacing={3}>
                <Grid item xs={4}>
                    <Paper className={classes.paper}>
                        <div className={classes.title}>Shortest Game</div>
                        <p><Link className={classes.link} to={`/match/${ShortestGame.MatchPId}`}>{ShortestGame.BlueTeamName} vs. {ShortestGame.RedTeamName}</Link> in {lhgString.time(ShortestGame.GameDuration)}</p>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <Paper className={classes.paper}>
                        <div className={classes.title}>Longest Game</div>
                        <p><Link className={classes.link} to={`/match/${LongestGame.MatchPId}`}>{LongestGame.BlueTeamName} vs. {LongestGame.RedTeamName}</Link> in {lhgString.time(LongestGame.GameDuration)}</p>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <Paper className={classes.paper}>
                        <div className={classes.title}>Bloodiest Game</div>
                        <p><Link className={classes.link} to={`/match/${MostKillGame.MatchPId}`}>{MostKillGame.BlueTeamName} vs. {MostKillGame.RedTeamName}</Link> {MostKillGame.Kills} Kills in {lhgString.time(MostKillGame.GameDuration)}</p>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    )
}
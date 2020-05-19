import React from 'react';
import { Link } from 'react-router-dom';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// Util
const fxn = require('../../util/Helper');

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
        'text-decoration': 'underline',
        fontSize: 'large',
    }
}));

export default function TourneyGameRecords({ gameRecords }) {
    const classes = useStyles();
    const { ShortestGame, LongestGame, MostKillGame } = gameRecords;

    return (
        <div>
        <Grid container spacing={3}>
            <Grid item xs={4}>
                <Paper className={classes.paper}>
                    <div className={classes.title}>Shortest Game</div>
                    <p><Link to={`/match/${ShortestGame.MatchPId}`}>{ShortestGame.BlueTeamName} vs. {ShortestGame.RedTeamName}</Link> in {fxn.timeString(ShortestGame.GameDuration)}</p>
                </Paper>
            </Grid>
            <Grid item xs={4}>
                <Paper className={classes.paper}>
                    <div className={classes.title}>Longest Game</div>
                    <p><Link to={`/match/${LongestGame.MatchPId}`}>{LongestGame.BlueTeamName} vs. {LongestGame.RedTeamName}</Link> in {fxn.timeString(LongestGame.GameDuration)}</p>
                </Paper>
            </Grid>
            <Grid item xs={4}>
                <Paper className={classes.paper}>
                    <div className={classes.title}>Bloodiest Game</div>
                    <p><Link to={`/match/${MostKillGame.MatchPId}`}>{MostKillGame.BlueTeamName} vs. {MostKillGame.RedTeamName}</Link> {MostKillGame.Kills} Kills in {fxn.timeString(MostKillGame.GameDuration)}</p>
                </Paper>
            </Grid>
        </Grid>
        </div>
    )
}
import React from 'react';
import { Link } from 'react-router-dom';
// Components

// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.primary,
        background: '#A9A9A9',
    },
}));

export default function SeasonHeader({ info }) {
    const classes = useStyles();

    let seasonBaseMarkup = info ? (
        <div className="body">
            <p><Link to={`/tournament/${info.TournamentPIds.RegTournamentShortName}`}>Regular Season Tournament Stats</Link></p>
            <p><Link to={`/tournament/${info.TournamentPIds.PostTournamentShortName}`}>Playoffs Tournament Stats</Link></p>
        </div>
    ) : ( <div></div> );

    return (
        <div className={classes.root}>
            <Grid container spacing={3}>
                <Grid item xs={12}><Paper className={classes.paper}>
                    {seasonBaseMarkup}
                </Paper></Grid>
            </Grid>
        </div>
    );
}
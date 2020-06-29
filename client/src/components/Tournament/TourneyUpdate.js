import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.primary,
        background: '#A9A9A9',
        'font-weight': 'bold',
    },
    title: {
        padding: theme.spacing(2),
        fontSize: 'large',
    },
    pad: {
        padding: theme.spacing(2),
    },
}));

export default function TourneyUpdateTemporary({ info, loading, handleSubmit, response }) {
    const classes = useStyles();

    const loadingComponent = (loading) ? (<div className={classes.pad}>
        <CircularProgress color="secondary" />
    </div>) : (<div></div>);
    const responseReceived = (response) ? (<div className={classes.pad}>
        Tournament Overall Stats updated!<br />
        {response.playersUpdated} Players updated<br />
        {response.teamsUpdated} Teams updated<br />
        {response.gamesUpdated} Games updated<br />
    </div>) : (<div></div>);

    return (
        <div>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <div className={classes.title}>The Forbidden "{info.TournamentName}" overall stats</div>
                        <form onSubmit={handleSubmit}>
                            <Button type="submit" variant="contained" color="primary">Update</Button>
                        </form>
                        {loadingComponent}
                        {responseReceived}
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}
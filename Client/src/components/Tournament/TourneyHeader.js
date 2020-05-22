import React from 'react';
import { Link } from 'react-router-dom';
// Components
import TourneyTab from './TourneyTab';
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
        'font-weight': 'bold',
    },
    link: {
        color: 'blue',
    },
}));

export default function TourneyHeader({ info, type }) {
    const classes = useStyles();

    let titleMarkUp = info ? (
        <div className="body">
            <p><Link className={classes.link} to={`/season/${info.SeasonShortName}`}>{info.SeasonName}</Link> {tourneyTypeString(info.TournamentType)}</p>
            <p>Tournament Stats</p>
        </div>
    ) : (<div></div>);

    let tourneyBar = info ? (
        <TourneyTab shortName={info.TournamentShortName} type={type}/>
    ) : (<div></div>);

    return (
        <div className={classes.root}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        {titleMarkUp}
                        {tourneyBar}
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}

function tourneyTypeString(str) {
    return (str === 'Regular') ? 
        "Regular Season" :
        "Playoffs";
}
import React from 'react';
import { Link } from 'react-router-dom';
// Components
import TourneyTab from './TourneyTab';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.primary,
        background: '#A9A9A9',
        'font-weight': 'bold',
    },
    titleMain: {
        fontWeight: 'bold',
        padding: theme.spacing(2),
        fontSize: 'x-large',
    },
    link: {
        color: 'blue',
    },
}));

export default function TourneyHeader({ info, type }) {
    const classes = useStyles();

    let titleMarkUp = (
        <div className={classes.titleMain}>
            <Link className={classes.link} to={`/season/${info.SeasonShortName}`}>{info.SeasonName}</Link> {tourneyTypeString(info.TournamentType)}
        </div>
    );
    let tourneyBar = ( <TourneyTab shortName={info.TournamentShortName} type={type}/> );

    return (
        <div>
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
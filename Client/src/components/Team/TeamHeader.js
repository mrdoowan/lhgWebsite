import React from 'react';
// Components
import TeamTab from './TeamTab';
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
    title: {
        fontSize: 'x-large',
    },
}));

export default function TeamHeader({ info, type }) {
    const classes = useStyles();

    let titleMarkUp = (
        <div className={classes.title}>
            <p>{info.TeamName}</p>
        </div>
    );
    let teamBar = ( <TeamTab name={info.TeamName} type={type} /> );
    
    return (
        <div>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        {titleMarkUp}
                        {teamBar}
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}
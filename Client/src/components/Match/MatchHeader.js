import React from 'react';
// Components
import MatchTab from './MatchTab';
import MatchTitle from './MatchTitle';
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
    },
    title: {
        fontSize: 'x-large',
        fontWeight: 'bold',
    },
}));

export default function MatchHeader({ match, type }) {
    const classes = useStyles();

    let titleComponent = ( <MatchTitle match={match} /> );
    let matchBar = ( <MatchTab id={match.MatchPId} type={type} /> );
    
    return (
        <div>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        {titleComponent}
                        {matchBar}
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}
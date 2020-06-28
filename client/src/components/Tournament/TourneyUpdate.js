import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

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
}));

export default function TourneyUpdateTemporary({ info }) {
    const classes = useStyles();

    return (
        <div>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <div className={classes.title}>Update "{info.TournamentName}" overall stats</div>
                        <Button type="submit" variant="contained" color="primary">Update</Button>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}
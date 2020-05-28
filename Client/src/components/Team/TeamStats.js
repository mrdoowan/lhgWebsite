import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// Components
import Dragdown from '../Dragdown';

const useStyles = makeStyles((theme) => ({
    paper: {
        height: "100%",
        padding: theme.spacing(2),
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        color: theme.palette.text.primary,
        background: '#A9A9A9',
    },
    title: {
        padding: theme.spacing(2),
        'text-decoration': 'bold',
        fontSize: 'large',
    },
}));

export default function TeamStats({ info, stats }) {
    const classes = useStyles();

    return (
        <div>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <Dragdown 
                            list={info.TournamentList} 
                            basePath={`/team/${info.TeamName}/stats`}
                            type="Teams"
                            title={stats.TournamentName}
                        />
                        <p className={classes.title}>Team Stats Coming Soon!</p>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    )
}
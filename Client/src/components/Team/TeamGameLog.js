import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

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
        fontWeight: 'bold',
        fontSize: 'large',
    },
}));

export default function TeamGameLog({ games, seasonList }) {
    const classes = useStyles();

    return (
        <Paper elevation={0} className={classes.paper}>
            <p className={classes.title}>Game Log Coming Soon!</p>
        </Paper>
    )
}
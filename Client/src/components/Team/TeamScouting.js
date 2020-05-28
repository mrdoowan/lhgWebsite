import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    title: {
        padding: theme.spacing(2),
        'text-decoration': 'bold',
        fontSize: 'large',
    },
}));

export default function TeamScouting({ scout, seasonList }) {
    const classes = useStyles();

    return (
        <div>
            <p className={classes.title}>Scouting Coming Soon!</p>
        </div>
    )
}
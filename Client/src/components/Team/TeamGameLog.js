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

export default function TeamGameLog({ games, seasonList }) {
    const classes = useStyles();

    return (
        <div>
            <p className={classes.title}>Game Log Coming Soon!</p>
        </div>
    )
}
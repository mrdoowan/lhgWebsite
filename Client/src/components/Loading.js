import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    title: {
        padding: theme.spacing(2),
    },
}));

export default function Loading() {
    const classes = useStyles();

    return (
        <div className={classes.title}>Loading...</div>
    )
}
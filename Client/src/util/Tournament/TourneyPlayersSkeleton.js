import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import TourneyHeader from '../../components/Tournament/TourneyHeader';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
}));

export default function TourneyPlayersSkeleton({info, players}) {
    const classes = useStyles();

    let headerMarkup = info ? (
        <div><TourneyHeader info={info} type='Players' /></div>
    ) : (<div></div>);

    let playersTable = players ? (
        <div></div>
    ) : (<div></div>)

    return (
        <div className={classes.root}>
            {headerMarkup}
            {playersTable}
        </div>
    )
}
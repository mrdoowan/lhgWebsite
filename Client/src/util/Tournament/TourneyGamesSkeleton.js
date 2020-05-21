import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import Loading from '../../components/Loading';
import TourneyHeader from '../../components/Tournament/TourneyHeader';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
}));

export default function TourneyGamesSkeleton({info, games}) {
    const classes = useStyles();

    let headerMarkup = info ? (
        <div><TourneyHeader info={info} type='Games' /></div>
    ) : (<div></div>);

    let gamesMarkup = games ? (
        <div></div>
    ) : (<div><Loading /></div>)

    return (
        <div className={classes.root}>
            {headerMarkup}
            {gamesMarkup}
        </div>
    )
}
import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import Loading from '../../components/Loading';
import TourneyHeader from '../../components/Tournament/TourneyHeader';
import PlayerDataGrid from '../../components/Tournament/PlayerDataGrid';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    title: {
        padding: theme.spacing(2),
        'text-decoration': 'underline',
        fontSize: 'large',
    },
}));

export default function TourneyPlayersSkeleton({info, players}) {
    const classes = useStyles();

    let headerMarkup = info ? (
        <div><TourneyHeader info={info} type='Players' /></div>
    ) : (<div></div>);

    let playersTable = players ? (
        <div><PlayerDataGrid players={players} /></div>
    ) : (<div><Loading /></div>)

    return (
        <div className={classes.root}>
            {headerMarkup}
            {playersTable}
        </div>
    )
}
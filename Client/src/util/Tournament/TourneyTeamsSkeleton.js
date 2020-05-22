import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import Loading from '../../components/Loading';
import TourneyHeader from '../../components/Tournament/TourneyHeader';
import TeamDataGrid from '../../components/Tournament/TeamDataGrid';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
}));

export default function TourneyTeamsSkeleton({info, teams}) {
    const classes = useStyles();

    let headerMarkup = info ? (
        <div><TourneyHeader info={info} type='Teams' /></div>
    ) : (<div></div>);

    let teamsTable = teams ? (
        <div><TeamDataGrid teams={teams} /></div>
    ) : (<div><Loading /></div>)

    return (
        <div className={classes.root}>
            {headerMarkup}
            {teamsTable}
        </div>
    )
}
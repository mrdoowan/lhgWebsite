import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import TourneyHeader from '../../components/Tournament/TourneyHeader';
import TourneyStats from '../../components/Tournament/TourneyStats';
import TourneyGameRecords from '../../components/Tournament/TourneyGameRecords';
import TourneyPlayerRecords from '../../components/Tournament/TourneyPlayerRecords';

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

export default function TourneyBaseSkeleton({info, stats, lb}) {
    const classes = useStyles();

    let headerMarkup = info ? (
        <div><TourneyHeader info={info} type='Tournament' /></div>
    ) : (<div></div>);

    let titleInfo = stats ? (
        <div className={classes.title}>Tournament Information</div>
    ) : (<div></div>)

    let statsMarkup = stats ? (
        <div><TourneyStats stats={stats} /></div>
    ) : (<div></div>);

    let gameMarkup = lb ? (
        <div><TourneyGameRecords gameRecords={lb.GameRecords} /></div>
    ) : (<div></div>);

    let titlePlayer = lb ? (
        <div className={classes.title}>Player Leaderboards</div>
    ) : (<div></div>);

    let playerLBMarkup = lb ? (
        <div><TourneyPlayerRecords playerRecords={lb.PlayerSingleRecords} /></div>
    ) : (<div></div>);

    let titleTeam = lb ? (
        <div className={classes.title}>Team Leaderboards</div>
    ) : (<div></div>);

    let teamLBMarkup = lb ? (
        <div></div>
    ) : (<div></div>);

    return (
        <div className={classes.root}>
            {headerMarkup}
            {titleInfo}
            {statsMarkup}
            {gameMarkup}
            {titlePlayer}
            {playerLBMarkup}
            {titleTeam}
            {teamLBMarkup}
        </div>
    )
}
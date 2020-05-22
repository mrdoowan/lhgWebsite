import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import Loading from '../../components/Loading';
import TourneyHeader from '../../components/Tournament/TourneyHeader';
import TourneyStats from '../../components/Tournament/TourneyStats';
import LeaderboardGames from '../../components/Tournament/LeaderboardGames';
import LeaderboardPlayers from '../../components/Tournament/LeaderboardPlayers';
import LeaderboardTeams from '../../components/Tournament/LeaderboardTeams';

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
    ) : (<div><Loading /></div>)

    let statsMarkup = stats ? (
        <div><TourneyStats stats={stats} /></div>
    ) : (<div></div>);

    let gameMarkup = lb ? (
        <div><LeaderboardGames gameRecords={lb.GameRecords} /></div>
    ) : (<div><Loading /></div>);

    let titlePlayer = lb ? (
        <div className={classes.title}>Player Leaderboards</div>
    ) : (<div></div>);

    let playerLBMarkup = lb ? (
        <div><LeaderboardPlayers playerRecords={lb.PlayerSingleRecords} /></div>
    ) : (<div></div>);

    let titleTeam = lb ? (
        <div className={classes.title}>Team Leaderboards</div>
    ) : (<div></div>);

    let teamLBMarkup = lb ? (
        <div><LeaderboardTeams teamRecords={lb.TeamSingleRecords} /></div>
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
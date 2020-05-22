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

    let statsMarkup = stats ? (
        <div>
            <p className={classes.title}>Tournament Information</p>
            <TourneyStats stats={stats} />
        </div>
    ) : (<div></div>);

    let gameMarkup = lb ? (
        <div><LeaderboardGames gameRecords={lb.GameRecords} /></div>
    ) : (<div><Loading /></div>);

    let playerLBMarkup = lb ? (
        <div>
            <p className={classes.title}>Player Leaderboards</p>
            <LeaderboardPlayers playerRecords={lb.PlayerSingleRecords} />
        </div>
    ) : (<div></div>);

    let teamLBMarkup = lb ? (
        <div>
            <p className={classes.title}>Team Leaderboards</p>
            <LeaderboardTeams teamRecords={lb.TeamSingleRecords} />
        </div>
    ) : (<div></div>);

    return (
        <div className={classes.root}>
            {headerMarkup}
            {statsMarkup}
            {gameMarkup}
            {playerLBMarkup}
            {teamLBMarkup}
        </div>
    )
}
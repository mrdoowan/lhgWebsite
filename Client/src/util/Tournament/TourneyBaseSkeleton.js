import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import TourneyHeader from '../../components/Tournament/TourneyHeader';
import TourneyStats from '../../components/Tournament/TourneyStats';
import LeaderboardGames from '../../components/Tournament/LeaderboardGames';
import LeaderboardPlayers from '../../components/Tournament/LeaderboardPlayers';
import LeaderboardTeams from '../../components/Tournament/LeaderboardTeams';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
}));

export default function TourneyBaseSkeleton({info, stats, lb}) {
    const classes = useStyles();

    let headerComponent = (<TourneyHeader info={info} type='Tournament' />);
    let statsComponent = (<TourneyStats stats={stats} />);
    let gameComponent = (<LeaderboardGames gameRecords={lb.GameRecords} />);
    let playerLBComponent = (<LeaderboardPlayers playerRecords={lb.PlayerSingleRecords} />);
    let teamLBComponent = (<LeaderboardTeams teamRecords={lb.TeamSingleRecords} />);

    let headerEmpty = "There is no information regarding this Tournament.";
    let statsEmpty = "There are no stats regarding this Tournament.";
    let lbEmpty = "There are no leaderboards regarding this Tournament.";

    let lbComponents = (
        <div>
            {gameComponent}
            {playerLBComponent}
            {teamLBComponent}
        </div>
    )

    return (
        <div className={classes.root}>
            <DataWrapper data={info} component={headerComponent} emptyMessage={headerEmpty} />
            <DataWrapper data={stats} component={statsComponent} emptyMessage={statsEmpty} />
            <DataWrapper data={lb} component={lbComponents} emptyMessage={lbEmpty} />
        </div>
    )
}
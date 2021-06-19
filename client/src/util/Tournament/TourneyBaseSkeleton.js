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
import TournamentHelmet from '../../components/Helmet/TournamentHelmet';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

export default function TourneyBaseSkeleton({ info, stats, lb }) {
  const classes = useStyles();

  const headerComponent = (<TourneyHeader info={info} type="Tournament" />);
  const statsComponent = (<TourneyStats stats={stats} />);
  const gameComponent = (<LeaderboardGames gameRecords={lb.GameRecords} />);
  const playerLBComponent = (<LeaderboardPlayers playerRecords={lb.PlayerSingleRecords} />);
  const teamLBComponent = (<LeaderboardTeams teamRecords={lb.TeamSingleRecords} />);
  const lbComponents = (
    <div>
      {gameComponent}
      {playerLBComponent}
      {teamLBComponent}
    </div>
  );

  const headerEmpty = 'There is no Information logged for this Tournament.';
  const statsEmpty = 'There are no Stats logged for this Tournament.';
  const lbEmpty = 'There are no Leaderboards logged for this Tournament.';

  return (
    <div className={classes.root}>
      <TournamentHelmet info={info} />
      <DataWrapper data={info} component={headerComponent} emptyMessage={headerEmpty} />
      <DataWrapper data={stats} component={statsComponent} emptyMessage={statsEmpty} />
      <DataWrapper data={lb} component={lbComponents} emptyMessage={lbEmpty} />
    </div>
  );
}

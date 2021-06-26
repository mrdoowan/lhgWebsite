import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import TourneyHeader from '../../components/Tournament/TourneyHeader';
import PlayerDataGrid from '../../components/Tournament/PlayerDataGrid';
import TournamentHelmet from '../../components/Helmet/TournamentHelmet';

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

export default function TourneyPlayersSkeleton({ info, players }) {
  const classes = useStyles();

  const headerComponent = (<TourneyHeader info={info} type="Players" />);
  const playersComponent = (
    <PlayerDataGrid players={players} seasonShortName={info.SeasonShortName} />
  );

  const headerEmpty = 'There is no Information logged for this Tournament.';
  const playersEmpty = 'There are no Player Stats logged for this Tournament.';

  return (
    <div className={classes.root}>
      <TournamentHelmet info={info} players={players} />
      <DataWrapper data={info} component={headerComponent} emptyMessage={headerEmpty} />
      <DataWrapper data={players} component={playersComponent} emptyMessage={playersEmpty} />
    </div>
  );
}

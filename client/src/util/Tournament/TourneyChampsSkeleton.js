import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import TourneyHeader from '../../components/Tournament/TourneyHeader';
import ChampsDataGrid from '../../components/Tournament/ChampsDataGrid';
import TournamentHelmet from '../../components/Helmet/TournamentHelmet';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

export default function TourneyChampsSkeleton({ info, pb }) {
  const classes = useStyles();

  const headerComponent = (<TourneyHeader info={info} type="Champs" />);
  const pickBansComponent = (<ChampsDataGrid pickbans={pb} />);

  const headerEmpty = 'There is no Information logged for this Tournament.';
  const pickBansEmpty = 'There are no Pick / Ban Stats logged for this Tournament.';

  return (
    <div className={classes.root}>
      <TournamentHelmet info={info} pickbans={pb} />
      <DataWrapper data={info} component={headerComponent} emptyMessage={headerEmpty} />
      <DataWrapper data={pb} component={pickBansComponent} emptyMessage={pickBansEmpty} />
    </div>
  );
}

import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import MatchHeader from '../../components/Match/MatchHeader';
import MatchBuilds from '../../components/Match/MatchBuilds';
import MatchHelmet from '../../components/Helmet/MatchHelmet';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

export default function MatchBuildsSkeleton({ match }) {
  const classes = useStyles();

  const headerComponent = (<MatchHeader match={match} type="Builds" />);
  const buildsComponent = (<MatchBuilds match={match} />);

  const infoEmpty = 'There is no Information logged for this Match.';
  const buildsEmpty = 'There are no Builds logged for this Match.';

  return (
    <div className={classes.root}>
      <MatchHelmet match={match} type="Builds" />
      <DataWrapper data={match} component={headerComponent} emptyMessage={infoEmpty} />
      <DataWrapper data={match} component={buildsComponent} emptyMessage={buildsEmpty} />
    </div>
  );
}

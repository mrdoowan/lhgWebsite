import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import MatchHeader from '../../components/Match/MatchHeader';
import MatchTimeline from '../../components/Match/MatchTimeline';
import MatchHelmet from '../../components/Helmet/MatchHelmet';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

export default function MatchTimelineSkeleton({ match }) {
  const classes = useStyles();

  const headerComponent = (<MatchHeader match={match} type="Timeline" />);
  const timelineComponent = (<MatchTimeline match={match} />);

  const infoEmpty = 'There is no Information logged for this Match.';
  const timelineEmpty = 'There is no Timeline logged for this Match.';

  return (
    <div className={classes.root}>
      <MatchHelmet match={match} type="Timeline" />
      <DataWrapper data={match} component={headerComponent} emptyMessage={infoEmpty} />
      <DataWrapper data={match} component={timelineComponent} emptyMessage={timelineEmpty} />
    </div>
  );
}

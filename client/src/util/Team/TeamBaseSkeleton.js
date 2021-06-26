import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import TeamHeader from '../../components/Team/TeamHeader';
import TeamInfo from '../../components/Team/TeamInfo';
import TeamHelmet from '../../components/Helmet/TeamHelmet';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

export default function TeamBaseSkeleton({ info }) {
  const classes = useStyles();

  const headerComponent = (<TeamHeader info={info} type="Team" />);
  const infoComponent = (<TeamInfo info={info} />);

  const headerEmpty = 'There is no Information logged for this Team.';

  return (
    <div className={classes.root}>
      <TeamHelmet info={info} />
      <DataWrapper data={info} component={headerComponent} emptyMessage={headerEmpty} />
      <DataWrapper data={info} component={infoComponent} emptyMessage={headerEmpty} />
    </div>
  );
}

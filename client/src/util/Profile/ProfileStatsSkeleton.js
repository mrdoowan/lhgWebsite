import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import ProfileHeader from '../../components/Profile/ProfileHeader';
import ProfileStats from '../../components/Profile/ProfileStats';
import ProfileHelmet from '../../components/Helmet/ProfileHelmet';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

export default function ProfileStatsSkeleton({ info, stats }) {
  const classes = useStyles();

  const headerComponent = (<ProfileHeader info={info} type="Stats" />);
  const statsComponent = (<ProfileStats stats={stats} />);

  const headerEmpty = 'There is no Information logged for this Player.';
  const statsEmpty = 'There are no Stats logged for this Player.';

  return (
    <div className={classes.root}>
      <ProfileHelmet info={info} stats={stats} />
      <DataWrapper data={info} component={headerComponent} emptyMessage={headerEmpty} />
      <DataWrapper data={stats} component={statsComponent} emptyMessage={statsEmpty} />
    </div>
  );
}

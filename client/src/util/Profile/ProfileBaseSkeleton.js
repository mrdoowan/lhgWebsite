import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import ProfileHeader from '../../components/Profile/ProfileHeader';
import ProfileInfo from '../../components/Profile/ProfileInfo';
import ProfileHelmet from '../../components/Helmet/ProfileHelmet';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

export default function ProfileBaseSkeleton({ info }) {
  const classes = useStyles();

  const headerComponent = (<ProfileHeader info={info} type={"Player"} />);
  const infoComponent = (<ProfileInfo info={info} />);

  const headerEmpty = 'There is no Information logged for this Player.';

  return (
    <div className={classes.root}>
      <ProfileHelmet info={info} />
      <DataWrapper data={info} component={headerComponent} emptyMessage={headerEmpty} />
      <DataWrapper data={info} component={infoComponent} emptyMessage={headerEmpty} />
    </div>
  );
}

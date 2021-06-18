import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import ProfileHeader from '../../components/Profile/ProfileHeader';
import ProfileGames from '../../components/Profile/ProfileGames';
import ProfileHelmet from '../../components/Helmet/ProfileHelmet';

const useStyles = makeStyles(() => ({
    root: {
        flexGrow: 1,
    },
}));

export default function ProfileGamesSkeleton({ info, games }) {
    const classes = useStyles();

    const headerComponent = (<ProfileHeader info={info} type={"Games"} />);
    const gamesComponent = (<ProfileGames info={info} games={games} />);

    const headerEmpty = "There is no Information logged for this Player.";
    const gamesEmpty = "There are no Games logged for this Player.";

    return (
        <div className={classes.root}>
            <ProfileHelmet info={info} games={games} />
            <DataWrapper data={info} component={headerComponent} emptyMessage={headerEmpty} />
            <DataWrapper data={games} component={gamesComponent} emptyMessage={gamesEmpty} />
        </div>
    )
}

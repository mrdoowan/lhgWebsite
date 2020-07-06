import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import ProfileHeader from '../../components/Profile/ProfileHeader';
import ProfileGames from '../../components/Profile/ProfileGames';
import ProfileHelmet from '../../components/Helmet/ProfileHelmet';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
}));

export default function ProfileGamesSkeleton({ info, games }) {
    const classes = useStyles();

    let headerComponent = (<ProfileHeader info={info} type={"Games"} />);
    let gamesComponent = (<ProfileGames games={games} />);
    
    let headerEmpty = "There is no Information logged for this Player.";
    let gamesEmpty = "There are no Games logged for this Player.";

    return (
        <div className={classes.root}>
            <ProfileHelmet info={info} games={games} />
            <DataWrapper data={info} component={headerComponent} emptyMessage={headerEmpty} />
            <DataWrapper data={games} component={gamesComponent} emptyMessage={gamesEmpty} />
        </div>
    )
}
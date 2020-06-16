import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import ProfileHeader from '../../components/Profile/ProfileHeader';
import ProfileInfo from '../../components/Profile/ProfileInfo';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
}));

export default function ProfileBaseSkeleton({ info }) {
    const classes = useStyles();

    let headerComponent = (<ProfileHeader info={info} type={"Player"} />);
    let infoComponent = (<ProfileInfo info={info} />);
    
    let headerEmpty = "There is no Information logged for this Player.";

    return (
        <div className={classes.root}>
            <DataWrapper data={info} component={headerComponent} emptyMessage={headerEmpty} />
            <DataWrapper data={info} component={infoComponent} emptyMessage={headerEmpty} />
        </div>
    )
}
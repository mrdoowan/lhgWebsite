import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import ProfileHeader from '../../components/Profile/ProfileHeader';
import ProfileStats from '../../components/Profile/ProfileStats';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
}));

export default function ProfileStatsSkeleton({ info, stats }) {
    const classes = useStyles();

    let headerComponent = (<ProfileHeader info={info} type={"Stats"} />);
    let statsComponent = (<ProfileStats stats={stats} />);
    
    let headerEmpty = "There is no Information logged for this Player.";
    let statsEmpty = "There are no Stats logged for this Player.";

    return (
        <div className={classes.root}>
            <DataWrapper data={info} component={headerComponent} emptyMessage={headerEmpty} />
            <DataWrapper data={info} component={statsComponent} emptyMessage={statsEmpty} />
        </div>
    )
}
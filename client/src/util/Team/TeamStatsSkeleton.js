import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import TeamHeader from '../../components/Team/TeamHeader';
import TeamStats from '../../components/Team/TeamStats';
import TeamHelmet from '../../components/Helmet/TeamHelmet';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
}));

export default function TeamStatsSkeleton({ info, stats }) {
    const classes = useStyles();

    let headerComponent = (<TeamHeader info={info} type='Stats' />);
    let statsComponent = (<TeamStats info={info} stats={stats} />);

    let headerEmpty = "There is no Information logged for this Team.";
    let statsEmpty = "There are no Stats logged for this Team."

    return (
        <div className={classes.root}>
            <TeamHelmet info={info} stats={stats} />
            <DataWrapper data={info} component={headerComponent} emptyMessage={headerEmpty} />
            <DataWrapper data={stats} component={statsComponent} emptyMessage={statsEmpty} />
        </div>
    )
}
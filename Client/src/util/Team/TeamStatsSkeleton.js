import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import TeamHeader from '../../components/Team/TeamHeader';
import TeamStats from '../../components/Team/TeamStats';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
}));

export default function TeamStatsSkeleton({ info, stats }) {
    const classes = useStyles();

    let headerComponent = (<TeamHeader info={info} type='Games' />);
    let statsComponent = (<TeamStats stats={stats} />);

    let headerEmpty = "There is no Information logged for this Tournament.";
    let statsEmpty = "There are no Stats logged for this Team."

    return (
        <div className={classes.root}>
            <DataWrapper data={info} component={headerComponent} emptyMessage={headerEmpty} />
            <DataWrapper data={stats} component={statsComponent} emptyMessage={statsEmpty} />
        </div>
    )
}
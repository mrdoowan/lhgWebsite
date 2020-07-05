import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import MatchHeader from '../../components/Match/MatchHeader';
import MatchBuilds from '../../components/Match/MatchBuilds';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
}));

export default function MatchBuildsSkeleton({ match }) {
    const classes = useStyles();

    let headerComponent = (<MatchHeader match={match} type="Builds" />);
    let buildsComponent = (<MatchBuilds match={match} />);
    
    let infoEmpty = "There is no Information logged for this Match.";
    let buildsEmpty = "There are no Builds logged for this Match.";

    return (
        <div className={classes.root}>
            <DataWrapper data={match} component={headerComponent} emptyMessage={infoEmpty} />
            <DataWrapper data={match} component={buildsComponent} emptyMessage={buildsEmpty} />
        </div>
    )
}
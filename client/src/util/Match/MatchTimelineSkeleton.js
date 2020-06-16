import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import MatchHeader from '../../components/Match/MatchHeader';
import MatchTimeline from '../../components/Match/MatchTimeline';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
}));

export default function MatchTimelineSkeleton({ match }) {
    const classes = useStyles();

    let headerComponent = (<MatchHeader match={match} type="Timeline" />);
    let timelineComponent = (<MatchTimeline match={match} />);
    
    let infoEmpty = "There is no Information logged for this Match.";
    let timelineEmpty = "There is no Timeline logged for this Match.";

    return (
        <div className={classes.root}>
            <DataWrapper data={match} component={headerComponent} emptyMessage={infoEmpty} />
            <DataWrapper data={match} component={timelineComponent} emptyMessage={timelineEmpty} />
        </div>
    )
}
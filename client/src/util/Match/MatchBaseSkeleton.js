import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import MatchHeader from '../../components/Match/MatchHeader';
import MatchSummary from '../../components/Match/MatchSummary';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
}));

export default function MatchBaseSkeleton({ match }) {
    const classes = useStyles();

    let headerComponent = (<MatchHeader match={match} type="Summary" />);
    let baseComponent = (<MatchSummary match={match} />);
    
    let infoEmpty = "There is no Information logged for this Match.";
    let baseEmpty = "There is no Summary logged for this Match.";

    return (
        <div className={classes.root}>
            <DataWrapper data={match} component={headerComponent} emptyMessage={infoEmpty} />
            <DataWrapper data={match} component={baseComponent} emptyMessage={baseEmpty} />
        </div>
    )
}
import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import MatchHeader from '../../components/Match/MatchHeader';
import MatchSummary from '../../components/Match/MatchSummary';
import MatchHelmet from '../../components/Helmet/MatchHelmet';

const useStyles = makeStyles(() => ({
    root: {
        flexGrow: 1,
    },
}));

export default function MatchBaseSkeleton({ match }) {
    const classes = useStyles();

    const headerComponent = (<MatchHeader match={match} type="Summary" />);
    const baseComponent = (<MatchSummary match={match} />);

    const infoEmpty = "There is no Information logged for this Match.";
    const baseEmpty = "There is no Summary logged for this Match.";

    return (
        <div className={classes.root}>
            <MatchHelmet match={match} type="Summary" />
            <DataWrapper data={match} component={headerComponent} emptyMessage={infoEmpty} />
            <DataWrapper data={match} component={baseComponent} emptyMessage={baseEmpty} />
        </div>
    )
}

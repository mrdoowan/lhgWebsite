import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import MatchHeader from '../../components/Match/MatchHeader';
import MatchStats from '../../components/Match/MatchStats';
import MatchHelmet from '../../components/Helmet/MatchHelmet';

const useStyles = makeStyles(() => ({
    root: {
        flexGrow: 1,
    },
}));

export default function MatchStatsSkeleton({ match }) {
    const classes = useStyles();

    const headerComponent = (<MatchHeader match={match} type="Stats" />);
    const statsComponent = (<MatchStats match={match} />);

    const infoEmpty = "There is no Information logged for this Match.";
    const statsEmpty = "There is no Stats logged for this Match.";

    return (
        <div className={classes.root}>
            <MatchHelmet match={match} type="Stats" />
            <DataWrapper data={match} component={headerComponent} emptyMessage={infoEmpty} />
            <DataWrapper data={match} component={statsComponent} emptyMessage={statsEmpty} />
        </div>
    )
}

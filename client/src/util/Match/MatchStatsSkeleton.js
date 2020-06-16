import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import MatchHeader from '../../components/Match/MatchHeader';
import MatchStats from '../../components/Match/MatchStats';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
}));

export default function MatchStatsSkeleton({ match }) {
    const classes = useStyles();

    let headerComponent = (<MatchHeader match={match} type="Stats" />);
    let statsComponent = (<MatchStats match={match} />);
    
    let infoEmpty = "There is no Information logged for this Match.";
    let statsEmpty = "There is no Stats logged for this Match.";

    return (
        <div className={classes.root}>
            <DataWrapper data={match} component={headerComponent} emptyMessage={infoEmpty} />
            <DataWrapper data={match} component={statsComponent} emptyMessage={statsEmpty} />
        </div>
    )
}
import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import TourneyHeader from '../../components/Tournament/TourneyHeader';
import TourneyGames from '../../components/Tournament/TourneyGames';
import TournamentHelmet from '../../components/Helmet/TournamentHelmet';

const useStyles = makeStyles(() => ({
    root: {
        flexGrow: 1,
    },
}));

export default function TourneyGamesSkeleton({ info, games }) {
    const classes = useStyles();

    const headerComponent = (<TourneyHeader info={info} type='Games' />);
    const gamesComponent = (<TourneyGames games={games} />);

    const headerEmpty = "There is no Information logged for this Tournament.";
    const gamesEmpty = "There are no Games logged for this Tournament.";

    return (
        <div className={classes.root}>
            <TournamentHelmet info={info} games={games} />
            <DataWrapper data={info} component={headerComponent} emptyMessage={headerEmpty} />
            <DataWrapper data={games} component={gamesComponent} emptyMessage={gamesEmpty} />
        </div>
    )
}

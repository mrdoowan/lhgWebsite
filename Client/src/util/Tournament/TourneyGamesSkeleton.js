import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import TourneyHeader from '../../components/Tournament/TourneyHeader';
import TourneyGames from '../../components/Tournament/TourneyGames';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
}));

export default function TourneyGamesSkeleton({info, games}) {
    const classes = useStyles();

    let headerComponent = (<TourneyHeader info={info} type='Games' />);
    let gamesComponent = (<TourneyGames games={games} />);

    let headerEmpty = "There is no Information logged for this Tournament.";
    let gamesEmpty = "There are no Games logged for this Tournament.";

    return (
        <div className={classes.root}>
            <DataWrapper data={info} component={headerComponent} emptyMessage={headerEmpty} />
            <DataWrapper data={games} component={gamesComponent} emptyMessage={gamesEmpty} />
        </div>
    )
}
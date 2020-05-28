import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import TeamHeader from '../../components/Team/TeamHeader';
import TeamGames from '../../components/Team/TeamGames';
import TeamScouting from '../../components/Team/TeamScouting';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
}));

export default function TeamGamesSkeleton({ info, scouting, games }) {
    const classes = useStyles();

    let headerComponent = (<TeamHeader info={info} type='Games' />);
    let scoutingComponent = (<TeamScouting scouting={scouting} seasonList={info.SeasonList} />);
    let gamesComponent = (<TeamGames games={games} seasonList={info.SeasonList} />);

    let headerEmpty = "There is no Information logged for this Team.";
    let scoutingEmpty = "There is no Scouting information for this Team."
    let gamesEmpty = "There are no Games logged for this Team.";

    return (
        <div className={classes.root}>
            <DataWrapper data={info} component={headerComponent} emptyMessage={headerEmpty} />
            <DataWrapper data={scouting} component={scoutingComponent} emptyMessage={scoutingEmpty} />
            <DataWrapper data={games} component={gamesComponent} emptyMessage={gamesEmpty} />
        </div>
    )
}
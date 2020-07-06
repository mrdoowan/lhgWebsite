import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import TeamHeader from '../../components/Team/TeamHeader';
import TeamGamesWrapper from '../../components/Team/TeamGamesWrapper';
import TeamHelmet from '../../components/Helmet/TeamHelmet';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
}));

export default function TeamGamesSkeleton({ info, scouting, games }) {
    const classes = useStyles();

    let headerComponent = (<TeamHeader info={info} type='Games' />);
    let gamesWrapperComponent = (<TeamGamesWrapper info={info} scouting={scouting} games={games} />);

    let headerEmpty = "There is no Information logged for this Team.";
    let gamesEmpty = "There are no Games logged for this Team.";

    return (
        <div className={classes.root}>
            <TeamHelmet info={info} scouting={scouting} games={games} />
            <DataWrapper data={info} component={headerComponent} emptyMessage={headerEmpty} />
            <DataWrapper data={games && scouting} component={gamesWrapperComponent} emptyMessage={gamesEmpty} />
        </div>
    )
}
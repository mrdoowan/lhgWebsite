import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import TourneyHeader from '../../components/Tournament/TourneyHeader';
import TeamDataGrid from '../../components/Tournament/TeamDataGrid';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
}));

export default function TourneyTeamsSkeleton({info, teams}) {
    const classes = useStyles();

    let headerComponent = (<TourneyHeader info={info} type='Teams' />);
    let teamsComponent = (<TeamDataGrid teams={teams.TeamList} />);

    let headerEmpty = "There is no Information logged for this Tournament.";
    let teamsEmpty = "There are no Team Stats logged for this Tournament.";

    return (
        <div className={classes.root}>
            <DataWrapper data={info} component={headerComponent} emptyMessage={headerEmpty} />
            <DataWrapper data={teams} component={teamsComponent} emptyMessage={teamsEmpty} />
        </div>
    )
}
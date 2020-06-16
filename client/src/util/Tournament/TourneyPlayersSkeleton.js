import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import TourneyHeader from '../../components/Tournament/TourneyHeader';
import PlayerDataGrid from '../../components/Tournament/PlayerDataGrid';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    title: {
        padding: theme.spacing(2),
        'text-decoration': 'underline',
        fontSize: 'large',
    },
}));

export default function TourneyPlayersSkeleton({info, players}) {
    const classes = useStyles();

    let headerComponent = (<TourneyHeader info={info} type='Players' />);
    let playersComponent = (<div><PlayerDataGrid players={players.PlayerList} /></div>);

    let headerEmpty = "There is no Information logged for this Tournament.";
    let playersEmpty = "There are no Player Stats logged for this Tournament.";

    return (
        <div className={classes.root}>
            <DataWrapper data={info} component={headerComponent} emptyMessage={headerEmpty} />
            <DataWrapper data={players} component={playersComponent} emptyMessage={playersEmpty} />
        </div>
    )
}
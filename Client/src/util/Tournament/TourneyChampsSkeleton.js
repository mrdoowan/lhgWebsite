import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import DataWrapper from '../../components/DataWrapper';
import TourneyHeader from '../../components/Tournament/TourneyHeader';
import ChampsDataGrid from '../../components/Tournament/ChampsDataGrid';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
}));

export default function TourneyChampsSkeleton({info, pb}) {
    const classes = useStyles();

    let headerComponent = (<TourneyHeader info={info} type='Champs' />);
    let pickBansComponent = (<ChampsDataGrid pickbans={pb} />);

    let headerEmpty = "There is no Information logged for this Tournament.";
    let pickBansEmpty = "There are no Pick / Ban Stats logged for this Tournament.";

    return (
        <div className={classes.root}>
            <DataWrapper data={info} component={headerComponent} emptyMessage={headerEmpty} />
            <DataWrapper data={pb} component={pickBansComponent} emptyMessage={pickBansEmpty} />
        </div>
    )
}
import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
// Components
import Loading from '../../components/Loading';
import TourneyHeader from '../../components/Tournament/TourneyHeader';
import ChampsDataGrid from '../../components/Tournament/ChampsDataGrid';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
}));

export default function TourneyChampsSkeleton({info, pb}) {
    const classes = useStyles();

    let headerMarkup = info ? (
        <div><TourneyHeader info={info} type='Champs' /></div>
    ) : (<div></div>);

    let pickBansMarkup = pb ? (
        <div><ChampsDataGrid pickbans={pb} /></div>
    ) : (<div><Loading /></div>)

    return (
        <div className={classes.root}>
            {headerMarkup}
            {pickBansMarkup}
        </div>
    )
}
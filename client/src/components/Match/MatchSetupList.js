import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import {
    Paper,
    Grid,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    paper: {
        height: "100%",
        padding: theme.spacing(1),
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: theme.palette.text.primary,
        background: '#A9A9A9',
    },
}));

export default function MatchSetupList({ setupListData }) {
    const classes = useStyles();

    console.log(setupListData);

    return (<div>
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper className={classes.paper}>
                    
                </Paper>
            </Grid>
        </Grid>
    </div>)
}
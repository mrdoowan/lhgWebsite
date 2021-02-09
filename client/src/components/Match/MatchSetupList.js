import React from "react";
import { Link } from 'react-router-dom';
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
    row: {
        padding: theme.spacing(2),
        fontWeight: 'bold',
    },
    title: {
        padding: theme.spacing(2),
        fontWeight: 'bold',
        textDecoration: 'underline',
        fontSize: 'xx-large',
    },
    link: {
        color: 'darkBlue',
    },
}));

export default function MatchSetupList({ setupListData }) {
    const classes = useStyles();

    return (<div>
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper className={classes.paper}>
                    <h1 className={classes.title}>
                        Match Setup Ids List
                    </h1>
                    {setupListData.map((matchId, idx) => (
                        <span className={classes.row} key={`matchSetup${idx}Link`}>
                            <Link to={`/match/${matchId}/setup`} className={classes.link}>{matchId}</Link> <br />
                        </span>
                    ))}
                </Paper>
            </Grid>
        </Grid>
    </div>)
}
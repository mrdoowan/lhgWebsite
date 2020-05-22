import React from 'react';
import { Link } from 'react-router-dom';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// Util
const lhgString = require('../../util/StringHelper');

const useStyles = makeStyles((theme) => ({
    paper: {
        height: "100%",
        padding: theme.spacing(1),
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        color: theme.palette.text.primary,
        background: '#A9A9A9',
    },
    title: {
        'text-decoration': 'underline',
        fontSize: 'large',
    },
    row: {
        padding: theme.spacing(1),
    },
    colDate: {
        width: "15%",
        textAlign: 'middle',
    },
    colBlue: {
        width: "35%",
        textAlign: 'right',
    },
    colVs: {
        width: "10%",
        textAlign: 'middle',
    },
    colRed: {
        width: "35%",
        textAlign: 'left',
    },
    colLink: {
        width: "5%",
        textAlign: 'middle',
    }
}));

export default function TourneyGames({ games }) {
    const classes = useStyles();

    return (
        <div>
        <Grid container spacing={3}>
            <Grid item xs={12}>
            <Paper className={classes.paper}>
                <div className={classes.title}>Game Log</div>
                <table>
                {Object.values(games).map((match) => (
                    <tr className={classes.row}>
                        <td className={classes.colDate}>{lhgString.dateString(match.DatePlayed)}</td>
                        <td className={classes.colBlue}><Link to={`/team/${match.BlueTeamName}`}></Link></td>
                        <td className={classes.colVs}></td>
                        <td className={classes.colRed}></td>
                        <td className={classes.colLink}>Link</td>
                    </tr>
                ))}
                </table>
            </Paper>
            </Grid>
        </Grid>
        </div>
    )
}

function teamName(name, side, win) {
    
}
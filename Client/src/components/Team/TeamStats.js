import React from 'react';
import { Link } from 'react-router-dom';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// Components
import Dragdown from '../Dragdown';
// Util
const lhgString = require('../../util/StringHelper');

const useStyles = makeStyles((theme) => ({
    paper: {
        height: "100%",
        padding: theme.spacing(2),
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        color: theme.palette.text.primary,
        background: '#A9A9A9',
    },
    title: {
        padding: theme.spacing(2),
        textDecoration: 'underline',
        fontSize: 'large',
    },
    colSeason: {
        width: "80%",
        textAlign: 'left',
        fontSize: 'x-large',
    },
    colDragdown: {
        width: "20%",
        textAlign: 'right',
    },
    colDesc: {
        width: "50%",
        textAlign: 'right',
        fontSize: 'large',
    },
    colValue: {
        width: "50%",
        textAlign: 'left',
        fontSize: 'large',
        padding: theme.spacing(2),
    },
}));

export default function TeamStats({ info, stats }) {
    const classes = useStyles();


    return (
        <div>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <table>
                            <tbody>
                                <tr>
                                    <td className={classes.colSeason}>
                                        <Link to={`/tournament/${stats.TournamentShortName}`}><b>{stats.TournamentName}</b></Link>
                                    </td>
                                    <td className={classes.colDragdown}>
                                    <Dragdown 
                                        list={info.TournamentList} 
                                        basePath={`/team/${info.TeamName}/stats`}
                                        type="Teams"
                                        title={stats.TournamentName}
                                    />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <br />
                        <table>
                            <tbody>
                                <tr>
                                    <td className={classes.colDesc}>Record:</td>
                                    <td className={classes.colValue}>({stats.GamesWon} - {stats.GamesPlayed - stats.GamesWon})</td>
                                </tr>
                                <tr>
                                    <td className={classes.colDesc}>Average Game Duration:</td>
                                    <td className={classes.colValue}>{lhgString.time(stats.AverageGameDuration)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </Paper>
                </Grid>
            </Grid>
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                        <div className={classes.title}>Combat</div>
                        <table>
                            <tbody>
                                
                            </tbody>
                        </table>
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                        <div className={classes.title}>Objectives</div>

                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                        <div className={classes.title}>Income</div>        

                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Paper className={classes.paper}>
                        <div className={classes.title}>Vision</div>

                    </Paper>
                </Grid>
            </Grid>
        </div>
    )
}
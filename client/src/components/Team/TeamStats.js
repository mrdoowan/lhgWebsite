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
        justifyContent: "top",
        color: theme.palette.text.primary,
        background: '#A9A9A9',
    },
    paper2: {
        height: "100%",
        padding: theme.spacing(2),
        display: "flex",
        flexDirection: "column",
        justifyContent: "top",
        color: theme.palette.text.primary,
        background: '#A9A9A9',
    },
    link: {
        color: 'blue',
    },
    title: {
        padding: theme.spacing(2),
        textDecoration: 'underline',
        fontWeight: 'bold',
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
    topDesc: {
        width: "49%",
        textAlign: 'right',
        fontWeight: 'bold',
    },
    topValue: {
        width: "51%",
        textAlign: 'left',
        paddingLeft: theme.spacing(3),
    },
    colDesc: {
        width: "45%",
        textAlign: 'right',
        fontWeight: 'bold',
    },
    colValue: {
        width: "55%",
        textAlign: 'left',
        paddingLeft: theme.spacing(3),
    },
}));

export default function TeamStats({ info, stats }) {
    const classes = useStyles();

    return (<div>
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper className={classes.paper}>
                    <table>
                        <tbody>
                            <tr>
                                <td className={classes.colSeason}>
                                    <Link to={`/tournament/${stats.TournamentShortName}/teams`} className={classes.link}><b>{stats.TournamentName}</b></Link>
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
                                <td className={classes.topDesc}>Record:</td>
                                <td className={classes.topValue}>({stats.GamesWon}W - {stats.GamesPlayed - stats.GamesWon}L)</td>
                            </tr>
                            <tr>
                                <td className={classes.topDesc}>Average Game Duration:</td>
                                <td className={classes.topValue}>{lhgString.time(stats.AverageGameDuration)}</td>
                            </tr>
                        </tbody>
                    </table>
                </Paper>
            </Grid>
        </Grid>
        <Grid container spacing={3}>
            <Grid item xs={6}>
                <Paper className={classes.paper2}>
                    <div className={classes.title}>Combat</div>
                    <table>
                        <tbody>
                            <tr>
                                <td className={classes.colDesc}>Total K/D/A:</td>
                                <td className={classes.colValue}>{stats.TotalKills} / {stats.TotalDeaths} / {stats.TotalAssists}</td>
                            </tr>
                            <tr>
                                <td className={classes.colDesc}>Kill/Death Ratio:</td>
                                <td className={classes.colValue}>{stats.KillDeathRatio}</td>
                            </tr>
                            <tr>
                                <td className={classes.colDesc}>First Blood %:</td>
                                <td className={classes.colValue}>{(stats.FirstBloodPct*100).toFixed(2)}% ({stats.TotalFirstBloods} First Bloods)</td>
                            </tr>
                            <tr>
                                <td className={classes.colDesc}>Damage Per Minute:</td>
                                <td className={classes.colValue}>{stats.DamagePerMinute} ({stats.TotalDamageDealt} Total Damage)</td>
                            </tr>
                            <tr>
                                <td className={classes.colDesc}>Average XP Diff @15:</td>
                                <td className={classes.colValue}>{stats.AverageXpDiffEarly}</td>
                            </tr>
                            <tr>
                                <td className={classes.colDesc}>Average XP Diff @25:</td>
                                <td className={classes.colValue}>{stats.AverageXpDiffMid}</td>
                            </tr>
                        </tbody>
                    </table>
                </Paper>
            </Grid>
            <Grid item xs={6}>
                <Paper className={classes.paper2}>
                    <div className={classes.title}>Objectives</div>
                    <table>
                        <tbody>
                            <tr>
                                <td className={classes.colDesc}>Dragon %:</td>
                                <td className={classes.colValue}>{(stats.DragonPct*100).toFixed(2)}% ({stats.TotalDragonsTaken}/{(stats.TotalDragonsTaken + stats.TotalEnemyDragons)} Dragons Taken)</td>
                            </tr>
                        </tbody>
                        <tbody>
                            <tr>
                                <td className={classes.colDesc}>Rift Herald %:</td>
                                <td className={classes.colValue}>{(stats.HeraldPct*100).toFixed(2)}% ({stats.TotalHeraldsTaken}/{(stats.TotalHeraldsTaken + stats.TotalEnemyHeralds)} Heralds Taken)</td>
                            </tr>
                        </tbody>
                        <tbody>
                            <tr>
                                <td className={classes.colDesc}>Baron %:</td>
                                <td className={classes.colValue}>{(stats.BaronPct*100).toFixed(2)}% ({stats.TotalBaronsTaken}/{(stats.TotalBaronsTaken + stats.TotalEnemyBarons)} Barons Taken)</td>
                            </tr>
                        </tbody>
                        <tbody>
                            <tr>
                                <td className={classes.colDesc}>Average Towers Taken:</td>
                                <td className={classes.colValue}>{stats.AverageTowersTaken}</td>
                            </tr>
                        </tbody>
                        <tbody>
                            <tr>
                                <td className={classes.colDesc}>Average Towers Lost:</td>
                                <td className={classes.colValue}>{stats.AverageTowersLost}</td>
                            </tr>
                        </tbody>
                        <tbody>
                            <tr>
                                <td className={classes.colDesc}>First Tower %:</td>
                                <td className={classes.colValue}>{(stats.FirstTowerPct*100).toFixed(2)}% ({stats.TotalFirstTowers} First Towers)</td>
                            </tr>
                        </tbody>
                    </table>
                </Paper>
            </Grid>
            <Grid item xs={6}>
                <Paper className={classes.paper2}>
                    <div className={classes.title}>Income</div>        
                    <table>
                        <tbody>
                            <tr>
                                <td className={classes.colDesc}>Gold Per Minute:</td>
                                <td className={classes.colValue}>{stats.GoldPerMinute} ({stats.TotalGold} Total Gold)</td>
                            </tr>
                            <tr>
                                <td className={classes.colDesc}>Creep Score Per Minute:</td>
                                <td className={classes.colValue}>{stats.CreepScorePerMinute} ({stats.TotalCreepScore} Total CS)</td>
                            </tr>
                            <tr>
                                <td className={classes.colDesc}>Average Gold Diff @15:</td>
                                <td className={classes.colValue}>{stats.AverageGoldDiffEarly}</td>
                            </tr>
                            <tr>
                                <td className={classes.colDesc}>Average Gold Diff @25:</td>
                                <td className={classes.colValue}>{stats.AverageGoldDiffMid}</td>
                            </tr>
                            <tr>
                                <td className={classes.colDesc}>Average CS Diff @15:</td>
                                <td className={classes.colValue}>{stats.AverageCsDiffEarly}</td>
                            </tr>
                            <tr>
                                <td className={classes.colDesc}>Average CS Diff @25:</td>
                                <td className={classes.colValue}>{stats.AverageCsDiffMid}</td>
                            </tr>
                        </tbody>
                    </table>
                </Paper>
            </Grid>
            <Grid item xs={6}>
                <Paper className={classes.paper2}>
                    <div className={classes.title}>Vision</div>
                    <table>
                        <tbody>
                            <tr>
                                <td className={classes.colDesc}>Vision Score Per Minute:</td>
                                <td className={classes.colValue}>{stats.VisionScorePerMinute} ({stats.TotalVisionScore} Total VS)</td>
                            </tr>
                            <tr>
                                <td className={classes.colDesc}>Wards Placed Per Minute:</td>
                                <td className={classes.colValue}>{stats.WardsPerMinute} ({stats.TotalWardsPlaced} Total Wards Placed)</td>
                            </tr>
                            <tr>
                                <td className={classes.colDesc}>Control Wards Bought Per Minute:</td>
                                <td className={classes.colValue}>{stats.ControlWardsPerMinute} ({stats.TotalControlWardsBought} Control Wards)</td>
                            </tr>
                            <tr>
                                <td className={classes.colDesc}>Wards Cleared Per Minute:</td>
                                <td className={classes.colValue}>{stats.WardsClearedPerMinute}</td>
                            </tr>
                            <tr>
                                <td className={classes.colDesc}>Wards Cleared Percentage:</td>
                                <td className={classes.colValue}>{(stats.WardsClearedPct*100).toFixed(2)}% ({stats.TotalWardsCleared}/{stats.TotalEnemyWardsPlaced} Wards Cleared)</td>
                            </tr>
                        </tbody>
                    </table>
                </Paper>
            </Grid>
        </Grid>
    </div>)
}
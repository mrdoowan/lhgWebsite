import React from "react";
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
// Components
import ChampionSquare from '../ChampionSquare';

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
        padding: theme.spacing(2),
        fontWeight: 'bold',
        textDecoration: 'underline',
        fontSize: 'large',
    },
    rowTeam: {
        padding: theme.spacing(5),
    },
    button: {
        padding: theme.spacing(2),
    },
    colBlueTeam: {
        width: "50%",
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'Blue',
        padding: theme.spacing(1),
    },
    colRedTeam: {
        width: "50%",
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#d83729',
        padding: theme.spacing(1),
    },
    textField: {
        margin: '10px auto 10px auto',
    },
    rowBody: {
        padding: theme.spacing(5),
        border: '1px solid black',
    },
    colBody: {
        width: "50%",
        padding: theme.spacing(2),
        border: '1px solid black',
    },

}));

export default function MatchSetup({ setupData }) {

    const classes = useStyles();
    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("Pog");
    }

    /**
     * @param {Array} playerList    Object of Players from Match GET Request "Setup"
     * @param {string} color        Either "blue" or "red"
     * @param {object} classes      Material-UI css class
     */
    const playerTableFields = (playerList, color, classes) => {
        return (<table><tbody>
            {playerList.map((playerObj, idx) => (
                <tr key={`${color}Player${idx}`}>
                    <td>
                        <ChampionSquare id={playerObj.ChampId} width="60" height="60" />
                    </td>
                    <td>
                        <input
                            id={`${color}PlayerName${idx}`}
                            name={`${color}Player${idx}`}
                            type="text"
                            defaultValue={playerObj.Name}
                            className={classes.textField}
                        />
                    </td>
                    <td>
                        <input
                            id={`${color}PlayerRole${idx}`}
                            name={`${color}Player${idx}`}
                            type="text"
                            defaultValue={playerObj.Role}
                            className={classes.textField}
                        />
                    </td>
                </tr>
            ))}
        </tbody></table>);
    }

    return (<div>
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper className={classes.paper}>
                    <p className={classes.title}>
                        {setupData.TournamentName} <br />
                        {setupData.RiotMatchId}
                    </p>
                    <table>
                        <thead>
                            <tr className={classes.rowTeam}>
                                <td className={classes.colBlueTeam}>
                                    <u>Blue Team Name</u> <br />
                                    <input
                                        id="blueTeamName"
                                        name="blueTeamName"
                                        type="text"
                                        defaultValue={setupData.Teams.BlueTeam.TeamName}
                                        className={classes.textField}
                                    />
                                </td>
                                <td className={classes.colRedTeam}>
                                    <u>Red Team Name</u> <br />
                                    <input
                                        id="redTeamName"
                                        name="redTeamName"
                                        type="text"
                                        defaultValue={setupData.Teams.RedTeam.TeamName}
                                        className={classes.textField}
                                    />
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className={classes.rowBody}>
                                <td className={classes.colBody} id="bluePlayers">
                                    {playerTableFields(setupData.Teams.BlueTeam.Players, 
                                        "blue", 
                                        classes)}
                                </td>
                                <td className={classes.colBody} id="redPlayers">
                                    {playerTableFields(setupData.Teams.RedTeam.Players, 
                                        "red", 
                                        classes)}
                                </td>
                            </tr>
                            <tr className={classes.rowBody}>
                                <td className={classes.colBody}>
                                    <b>Bans: </b>
                                </td>
                                <td className={classes.colBody}>
                                    <b>Bans: </b>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    {/* https://stackoverflow.com/questions/37462047/how-to-create-several-submit-buttons-in-a-react-js-form */}
                    <form onSubmit={handleSubmit} className={classes.button}>
                        <Button type="submit" variant="contained" color="primary" >Submit</Button>
                    </form>
                </Paper>
            </Grid>
        </Grid>
    </div>);
}
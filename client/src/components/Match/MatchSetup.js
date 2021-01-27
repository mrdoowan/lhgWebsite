import React from "react";
// Formik
import { Formik, Form, Field } from 'formik';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import {
    Paper,
    Grid,
    Button,
} from '@material-ui/core';
import {
    TextField,
} from 'formik-material-ui';
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
                        name={`${color}PlayerName${idx}`}
                        type="text"
                        defaultValue={playerObj.Name}
                        className={classes.textField}
                    />
                </td>
                <td>
                    <input
                        id={`${color}PlayerRole${idx}`}
                        name={`${color}PlayerRole${idx}`}
                        type="text"
                        defaultValue={playerObj.Role}
                        className={classes.textField}
                    />
                </td>
            </tr>
        ))}
    </tbody></table>);
}

export default function MatchSetup({ setupData }) {

    const classes = useStyles();
    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("Pog");
    }

    return (<div>
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper className={classes.paper}>
                    <h1 className={classes.title}>
                        {setupData.TournamentName} <br />
                        {setupData.RiotMatchId}
                    </h1>
                    <Formik
                        initialValues={{
                            blueTeamName: setupData?.Teams?.BlueTeam?.TeamName,
                            redTeamName: setupData?.Teams?.RedTeam?.TeamName,
                            bluePlayerName0: setupData?.Teams?.BlueTeam?.Players[0]?.SummonerName,
                            bluePlayerName1: setupData?.Teams?.BlueTeam?.Players[1]?.SummonerName,
                            bluePlayerName2: setupData?.Teams?.BlueTeam?.Players[2]?.SummonerName,
                            bluePlayerName3: setupData?.Teams?.BlueTeam?.Players[3]?.SummonerName,
                            bluePlayerName4: setupData?.Teams?.BlueTeam?.Players[4]?.SummonerName,
                            bluePlayerRole0: setupData?.Teams?.BlueTeam?.Players[0]?.Role,
                            bluePlayerRole1: setupData?.Teams?.BlueTeam?.Players[1]?.Role,
                            bluePlayerRole2: setupData?.Teams?.BlueTeam?.Players[2]?.Role,
                            bluePlayerRole3: setupData?.Teams?.BlueTeam?.Players[3]?.Role,
                            bluePlayerRole4: setupData?.Teams?.BlueTeam?.Players[4]?.Role,
                            redPlayerName0: setupData?.Teams?.RedTeam?.Players[0]?.SummonerName,
                            redPlayerName1: setupData?.Teams?.RedTeam?.Players[1]?.SummonerName,
                            redPlayerName2: setupData?.Teams?.RedTeam?.Players[2]?.SummonerName,
                            redPlayerName3: setupData?.Teams?.RedTeam?.Players[3]?.SummonerName,
                            redPlayerName4: setupData?.Teams?.RedTeam?.Players[4]?.SummonerName,
                            redPlayerRole0: setupData?.Teams?.RedTeam?.Players[0]?.Role,
                            redPlayerRole1: setupData?.Teams?.RedTeam?.Players[1]?.Role,
                            redPlayerRole2: setupData?.Teams?.RedTeam?.Players[2]?.Role,
                            redPlayerRole3: setupData?.Teams?.RedTeam?.Players[3]?.Role,
                            redPlayerRole4: setupData?.Teams?.RedTeam?.Players[4]?.Role,
                        }}
                    >
                        <Form>
                            <table>
                                <thead>
                                    <tr className={classes.rowTeam}>
                                        <td className={classes.colBlueTeam}>
                                            <u>Blue Team Name</u> <br />
                                            <Field
                                                component={TextField}
                                                type="blueTeamName"
                                                name="blueTeamName"
                                                className={classes.textField}
                                                variant="filled"
                                                inputProps={{min: 0, style: { textAlign: 'center' }}}
                                            />
                                        </td>
                                        <td className={classes.colRedTeam}>
                                            <u>Red Team Name</u> <br />
                                            <Field
                                                component={TextField}
                                                type="redTeamName"
                                                name="redTeamName"
                                                className={classes.textField}
                                                variant="filled"
                                                inputProps={{min: 0, style: { textAlign: 'center' }}}
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
                        </Form>
                    </Formik>
                </Paper>
            </Grid>
        </Grid>
    </div>);
}
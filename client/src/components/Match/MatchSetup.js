import React, { useState } from "react";
// Formik
import { Formik, Form, Field } from 'formik';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import {
    Paper,
    Grid,
    Button,
    MenuItem,
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
        alignItems: "center",
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
    const [submitButtonPressed, setSubmitButtonPressed] = useState(false);
    const [saveButtonPressed, setSaveButtonPressed] = useState(false);
    const { Teams: { BlueTeam, RedTeam} } = setupData;

    /**
     * @param {Array} playerList    Object of Players from Match GET Request "Setup"
     * @param {string} color        Either "blue" or "red"
     * @param {object} classes      Material-UI css class
     */
    const playerTableFields = (playerList, color, classes) => {
        const rolesList = ["Top", "Jungle", "Middle", "Bottom", "Support"];

        return (<table><tbody>
            {playerList.map((player, idx) => (
                <tr key={`${color}Player${idx}`}>
                    <td>
                        <ChampionSquare 
                            id={player.ChampId}
                            width="60"
                            height="60"
                        />
                    </td>
                    <td>
                        <Field
                            component={TextField}
                            type={`${color}PlayerName${idx}`}
                            name={`${color}PlayerName${idx}`}
                            className={classes.textField}
                            variant="filled"
                        />
                    </td>
                    <td>
                        <Field
                            component={TextField}
                            type={`${color}PlayerRole${idx}`}
                            name={`${color}PlayerRole${idx}`}
                            select
                            fullWidth
                            className={classes.textField}
                            variant="filled"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        >
                            {rolesList.map((role) => (
                                <MenuItem key={`role-${role}`} value={role}>
                                    {role}
                                </MenuItem>
                            ))}
                        </Field>
                    </td>
                </tr>
            ))}
        </tbody></table>);
    }

    /**
     * 
     * @param {Array} banList 
     * @param {string} color 
     * @param {object} classes 
     */
    const bansTableFields = (banList, color, classes) => {
        return (<table><tbody>
            <tr key={`${color}TeamBans`}>
                {banList.map((banId, idx) => (
                    <td key={`${color}TeamBanTextField${idx}`}>
                        <ChampionSquare 
                            id={banId}
                            width="45"
                            height="45"
                        />
                        <br />
                        <Field
                            component={TextField}
                            type={`${color}TeamBanId${idx}`}
                            name={`${color}TeamBanId${idx}`}
                            className={classes.textField}
                            variant="filled"
                            inputProps={{
                                min: 0, 
                                style: { textAlign: 'center' }
                            }}
                        />
                    </td>
                ))}
            </tr>
        </tbody></table>);
    }

    /**
     * Formik's submit handler
     */
    const handleSubmit = (values, {setSubmitting}) => {
        if (submitButtonPressed) {
            console.log("Submit!");
            console.log(values);
            setSubmitButtonPressed(false);
        }
        else if (saveButtonPressed) {
            console.log("Saved!");
            console.log(values);
            setSaveButtonPressed(false);
        }
        setSubmitting(false);
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
                            blueTeamName: BlueTeam?.TeamName || '',
                            redTeamName: RedTeam?.TeamName || '',
                            bluePlayerName0: BlueTeam?.Players[0]?.SummonerName || '',
                            bluePlayerName1: BlueTeam?.Players[1]?.SummonerName || '',
                            bluePlayerName2: BlueTeam?.Players[2]?.SummonerName || '',
                            bluePlayerName3: BlueTeam?.Players[3]?.SummonerName || '',
                            bluePlayerName4: BlueTeam?.Players[4]?.SummonerName || '',
                            bluePlayerRole0: BlueTeam?.Players[0]?.Role || '',
                            bluePlayerRole1: BlueTeam?.Players[1]?.Role || '',
                            bluePlayerRole2: BlueTeam?.Players[2]?.Role || '',
                            bluePlayerRole3: BlueTeam?.Players[3]?.Role || '',
                            bluePlayerRole4: BlueTeam?.Players[4]?.Role || '',
                            redPlayerName0: RedTeam?.Players[0]?.SummonerName || '',
                            redPlayerName1: RedTeam?.Players[1]?.SummonerName || '',
                            redPlayerName2: RedTeam?.Players[2]?.SummonerName || '',
                            redPlayerName3: RedTeam?.Players[3]?.SummonerName || '',
                            redPlayerName4: RedTeam?.Players[4]?.SummonerName || '',
                            redPlayerRole0: RedTeam?.Players[0]?.Role || '',
                            redPlayerRole1: RedTeam?.Players[1]?.Role || '',
                            redPlayerRole2: RedTeam?.Players[2]?.Role || '',
                            redPlayerRole3: RedTeam?.Players[3]?.Role || '',
                            redPlayerRole4: RedTeam?.Players[4]?.Role || '',
                            blueTeamBanId0: BlueTeam?.Bans[0] || '',
                            blueTeamBanId1: BlueTeam?.Bans[1] || '',
                            blueTeamBanId2: BlueTeam?.Bans[2] || '',
                            blueTeamBanId3: BlueTeam?.Bans[3] || '',
                            blueTeamBanId4: BlueTeam?.Bans[4] || '',
                            redTeamBanId0: RedTeam?.Bans[0] || '',
                            redTeamBanId1: RedTeam?.Bans[1] || '',
                            redTeamBanId2: RedTeam?.Bans[2] || '',
                            redTeamBanId3: RedTeam?.Bans[3] || '',
                            redTeamBanId4: RedTeam?.Bans[4] || '',
                        }}
                        validate={() => {}}
                        onSubmit={handleSubmit}
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
                                            {playerTableFields(BlueTeam?.Players, 
                                                "blue", 
                                                classes)}
                                        </td>
                                        <td className={classes.colBody} id="redPlayers">
                                            {playerTableFields(RedTeam?.Players, 
                                                "red", 
                                                classes)}
                                        </td>
                                    </tr>
                                    <tr className={classes.rowBody}>
                                        <td className={classes.colBody}>
                                            <b><u>Bans</u></b>
                                            {bansTableFields(BlueTeam?.Bans, "blue", classes)}
                                        </td>
                                        <td className={classes.colBody}>
                                            <b><u>Bans</u></b>
                                            {bansTableFields(RedTeam?.Bans, "red", classes)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <br />
                            { /* https://stackoverflow.com/questions/37462047/how-to-create-several-submit-buttons-in-a-react-js-form */ }
                            { /* https://stackoverflow.com/questions/60349756/react-js-two-submit-buttons-in-one-form */ }
                            <Button 
                                onClick={() => { 
                                    setSubmitButtonPressed(true); 
                                }}
                                type="submit" 
                                variant="contained" 
                                color="primary" 
                            >
                                Submit
                            </Button>
                            <Button 
                                onClick={() => { 
                                    setSaveButtonPressed(true); 
                                }}
                                type="submit" 
                                variant="contained" 
                                color="secondary" 
                            >
                                Save
                            </Button>
                        </Form>
                    </Formik>
                </Paper>
            </Grid>
        </Grid>
    </div>);
}
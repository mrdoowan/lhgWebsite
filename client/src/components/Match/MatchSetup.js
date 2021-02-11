import React, { useState } from "react";
import axios from 'axios';
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
    const { Teams: { BlueTeam, RedTeam} } = setupData;
    const BLUE = "blue";
    const RED = "red";
    const NUMBER_OF_PLAYERS = 5;
    const NUMBER_OF_BANS = 5;

    const [submitButtonPressed, setSubmitButtonPressed] = useState(false);
    const [saveButtonPressed, setSaveButtonPressed] = useState(false);
    const [messageList, setMessageList] = useState([]);
    /**
     * Add to message list that will be displayed at the bottom of page
     * @param {string} message 
     */
    const appendMessage = (message) => {
        setMessageList(messageList => [...messageList, message]);
    }
    /**
     * Initializes the array and add 0s if length < 5
     * @param {Array} dataBansList  BlueTeam.Bans / RedTeam.Bans
     */
    const initBansList = (dataBansList) => {
        for (let i = 0; i < NUMBER_OF_BANS - dataBansList.length; ++i) {
            dataBansList.push(0);
        }
        return dataBansList;
    }
    const [blueBansList, setBlueBansList] = useState(initBansList(BlueTeam.Bans));
    const [redBansList, setRedBansList] = useState(initBansList(RedTeam.Bans));

    /**
     * Capitalizes the string s
     * @param {string} s
     */
    const capitalize = (s) => {
        if (typeof(s) !== 'string') return '';
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    /**
     * Transforming the formik values from MatchSetup into a body object
     * for the Save Match Setup PUT API request
     * @param {*} values 
     */
    const transformValueData = (values) => {
        const transformedObject = {
            matchId: setupData.RiotMatchId,
            teams: {
                BlueTeam: {
                    Bans: [],
                    Players: [],
                    TeamName: values.blueTeamName,
                },
                RedTeam: {
                    Bans: [],
                    Players: [],
                    TeamName: values.redTeamName,
                },
            }
        };

        /**
         * @param {string} color    'blue', 'red'
         */
        const loadBansIntoObject = (color) => {
            const bansList = [];
            for (let i = 0; i < NUMBER_OF_BANS; ++i) {
                const numberValue = parseInt(values[`${color}TeamBanId${i}`]);
                bansList.push((numberValue) ? numberValue : 0);
            }
            const capitalColor = capitalize(color);
            transformedObject.teams[`${capitalColor}Team`].Bans = bansList;
        }

        /**
         * @param {string} color    'blue', 'red'
         */
        const loadPlayersIntoObject = (color) => {
            const playersList = [];
            for (let i = 0; i < NUMBER_OF_PLAYERS; ++i) {
                playersList.push({
                    Role: values[`${color}PlayerRole${i}`],
                    SummonerName: values[`${color}PlayerName${i}`],
                });
            }
            const capitalColor = capitalize(color);
            transformedObject.teams[`${capitalColor}Team`].Players = playersList;
        }

        // BansList
        loadBansIntoObject(BLUE);
        loadBansIntoObject(RED);
        // PlayersList
        loadPlayersIntoObject(BLUE);
        loadPlayersIntoObject(RED);
     
        return transformedObject;
    }

    /**
     * Formik's submit handler
     */
    const handleSubmit = (values, {setSubmitting}) => {
        setMessageList([]);
        if (submitButtonPressed) {
            console.log("Submit!");
            console.log(values);
            setSubmitButtonPressed(false);
            setSubmitting(false);
        }
        else if (saveButtonPressed) {
            axios.put('/api/match/v1/setup/save', 
                transformValueData(values)
            ).then(() => {
                appendMessage(
                    'Setup saved!'
                );
            }).catch(() => {
                appendMessage(
                    'Setup save failed...'
                );
            }).finally(() => {
                setSaveButtonPressed(false);
                setSubmitting(false);
            });
        }
    }

    /**
     * OnBlur handler to check if ban value was changed
     * @param {number} newBan
     * @param {string} color 
     * @param {number} index 
     */
    const handleBanBlur = (color, index, newBanId) => {
        const thisBansList = (color === BLUE) ? blueBansList : redBansList;
        if (thisBansList[index] !== newBanId) {
            let newBansList = [...thisBansList];
            newBansList[index] = newBanId;
            if (color === BLUE) {
                setBlueBansList(newBansList);
            }
            else {
                setRedBansList(newBansList);
            }
        }
    }

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
            <tr key={`${color}TeamBanImages`}>
                {banList.map((banId, idx) => (
                    <td key={`${color}TeamBanImage${idx}`}>
                        {banId !== 0 && <ChampionSquare 
                            id={banId}
                            width="45"
                            height="45"
                        />}
                        <br />
                    </td>
                ))}
            </tr>
            <tr key={`${color}TeamBanTextFields`}>
                {banList.map((banId, idx) => (
                    <td key={`${color}TeamBanTextField${idx}`}>
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
                            onBlur={(event) => {
                                handleBanBlur(color, idx, event.target.value);
                            }}
                        />
                    </td>
                ))}
            </tr>
        </tbody></table>);
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
                                            {playerTableFields(BlueTeam?.Players, BLUE, classes)}
                                        </td>
                                        <td className={classes.colBody} id="redPlayers">
                                            {playerTableFields(RedTeam?.Players, RED, classes)}
                                        </td>
                                    </tr>
                                    <tr className={classes.rowBody}>
                                        <td className={classes.colBody}>
                                            <b><u>Bans</u></b>
                                            {bansTableFields(blueBansList, BLUE, classes)}
                                        </td>
                                        <td className={classes.colBody}>
                                            <b><u>Bans</u></b>
                                            {bansTableFields(redBansList, RED, classes)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <br />
                            { /* https://stackoverflow.com/questions/60349756/react-js-two-submit-buttons-in-one-form */ }
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
                        </Form>
                    </Formik>
                    <h2 className={classes.title}>
                        {messageList.map((message) => (
                            <React.Fragment>{message} <br /></React.Fragment>
                        ))}
                    </h2>
                </Paper>
            </Grid>
        </Grid>
    </div>);
}
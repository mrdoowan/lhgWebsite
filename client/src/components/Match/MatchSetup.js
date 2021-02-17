import React, { useState } from "react";
import { useHistory } from "react-router-dom";
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
    const { Teams: { BlueTeam: blueTeamDb, RedTeam: redTeamDb} } = setupData;
    const BLUE = "blue";
    const RED = "red";
    const NUMBER_OF_PLAYERS = 5;
    const NUMBER_OF_BANS = 5;
    const history = useHistory();

    const [submitButtonPressed, setSubmitButtonPressed] = useState(false);
    const [saveButtonPressed, setSaveButtonPressed] = useState(false);
    const [messageList, setMessageList] = useState([]);
    /**
     * Add to message list that will be displayed at the bottom of page
     * @param {string} message 
     */
    const appendMessage = (message) => {
        if (Array.isArray(message)) {
            setMessageList(oldMessageList => [...oldMessageList, ...message]);
        }
        else {
            setMessageList(oldMessageList => [...oldMessageList, message]);
        }
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
    const [blueBansList, setBlueBansList] = useState(initBansList(blueTeamDb.Bans));
    const [redBansList, setRedBansList] = useState(initBansList(redTeamDb.Bans));

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
                    ProfileName: values[`${color}PlayerName${i}`],
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
    const handleSubmit = async (values, {setSubmitting}) => {
        const callMatchSetupSubmit = async () => {
            axios.put('/api/match/v1/setup/submit',
                { matchId: setupData.RiotMatchId }
            ).then(() => {
                // Redirect link to new match link
                history.push(`/match/${setupData.RiotMatchId}`);
            }).catch((err) => {
                if (err.response.status === 500) {
                    appendMessage(
                        'Setup Submit PUT request failed...'
                    );
                }
                else {
                    const { data: { data } } = err.response;
                    appendMessage(
                        data.validateMessages
                    );
                }
            }).finally(() => {
                setSaveButtonPressed(false);
                setSubmitting(false);
            });
        };
        const callMatchSetupSave = async () => {
            axios.put('/api/match/v1/setup/save', 
                transformValueData(values)
            ).then(() => {
                appendMessage(
                    'Setup saved!'
                );
            }).catch(() => {
                appendMessage(
                    'Setup Save PUT request failed...'
                );
            }).finally(() => {
                setSaveButtonPressed(false);
                setSubmitting(false);
            });
        }

        setMessageList([]);
        if (submitButtonPressed) {
            await callMatchSetupSave();
            await callMatchSetupSubmit();
        }
        else if (saveButtonPressed) {
            callMatchSetupSave();
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
                            blueTeamName: blueTeamDb?.TeamName || '',
                            redTeamName: redTeamDb?.TeamName || '',
                            bluePlayerName0: blueTeamDb?.Players[0]?.ProfileName || '',
                            bluePlayerName1: blueTeamDb?.Players[1]?.ProfileName || '',
                            bluePlayerName2: blueTeamDb?.Players[2]?.ProfileName || '',
                            bluePlayerName3: blueTeamDb?.Players[3]?.ProfileName || '',
                            bluePlayerName4: blueTeamDb?.Players[4]?.ProfileName || '',
                            bluePlayerRole0: blueTeamDb?.Players[0]?.Role || '',
                            bluePlayerRole1: blueTeamDb?.Players[1]?.Role || '',
                            bluePlayerRole2: blueTeamDb?.Players[2]?.Role || '',
                            bluePlayerRole3: blueTeamDb?.Players[3]?.Role || '',
                            bluePlayerRole4: blueTeamDb?.Players[4]?.Role || '',
                            redPlayerName0: redTeamDb?.Players[0]?.ProfileName || '',
                            redPlayerName1: redTeamDb?.Players[1]?.ProfileName || '',
                            redPlayerName2: redTeamDb?.Players[2]?.ProfileName || '',
                            redPlayerName3: redTeamDb?.Players[3]?.ProfileName || '',
                            redPlayerName4: redTeamDb?.Players[4]?.ProfileName || '',
                            redPlayerRole0: redTeamDb?.Players[0]?.Role || '',
                            redPlayerRole1: redTeamDb?.Players[1]?.Role || '',
                            redPlayerRole2: redTeamDb?.Players[2]?.Role || '',
                            redPlayerRole3: redTeamDb?.Players[3]?.Role || '',
                            redPlayerRole4: redTeamDb?.Players[4]?.Role || '',
                            blueTeamBanId0: blueTeamDb?.Bans[0] || '',
                            blueTeamBanId1: blueTeamDb?.Bans[1] || '',
                            blueTeamBanId2: blueTeamDb?.Bans[2] || '',
                            blueTeamBanId3: blueTeamDb?.Bans[3] || '',
                            blueTeamBanId4: blueTeamDb?.Bans[4] || '',
                            redTeamBanId0: redTeamDb?.Bans[0] || '',
                            redTeamBanId1: redTeamDb?.Bans[1] || '',
                            redTeamBanId2: redTeamDb?.Bans[2] || '',
                            redTeamBanId3: redTeamDb?.Bans[3] || '',
                            redTeamBanId4: redTeamDb?.Bans[4] || '',
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
                                            {playerTableFields(blueTeamDb?.Players, BLUE, classes)}
                                        </td>
                                        <td className={classes.colBody} id="redPlayers">
                                            {playerTableFields(redTeamDb?.Players, RED, classes)}
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
                        {messageList.map((message, idx) => (
                            <React.Fragment key={idx}>
                                <div className="error-message">
                                    {message}<br />
                                </div>
                            </React.Fragment>
                        ))}
                    </h2>
                </Paper>
            </Grid>
        </Grid>
    </div>);
}
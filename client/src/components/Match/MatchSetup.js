import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
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
// react-bootstrap
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

const useStyles = makeStyles((theme) => ({
  paper: {
    height: '100%',
    padding: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
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
    width: '50%',
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'Blue',
    padding: theme.spacing(1),
  },
  colRedTeam: {
    width: '50%',
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
    width: '50%',
    padding: theme.spacing(2),
    border: '1px solid black',
  },
}));

export default function MatchSetup({ setupData }) {
  const classes = useStyles();
  const { Teams: { BlueTeam: blueTeamSetupObject, RedTeam: redTeamSetupObject} } = setupData;
  const BLUE = 'blue';
  const RED = 'red';
  const NUMBER_OF_PLAYERS = 5;
  const NUMBER_OF_BANS = 5;
  const history = useHistory();

  // #region Helper Functions
  /**
   * Add to message list that will be displayed at the bottom of page
   * @param {string} message
   */
  const appendMessage = (message) => {
    if (Array.isArray(message)) {
      setMessageList((oldMessageList) => [...oldMessageList, ...message]);
    } else {
      setMessageList((oldMessageList) => [...oldMessageList, message]);
    }
  };

  /**
   * Initializes the array and add 0s if length < 5
   * @param {Array} dataBansList  BlueTeam.Bans / RedTeam.Bans
   */
  const initBansList = (dataBansList) => {
    for (let i = 0; i < NUMBER_OF_BANS - dataBansList.length; i += 1) {
      dataBansList.push(0);
    }
    return dataBansList;
  };

  /**
   * Capitalizes the string s
   * @param {string} s
   */
  const capitalize = (s) => {
    if (typeof (s) !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  /**
   * Transforming the formik values from MatchSetup into a body object
   * for the Save Match Setup PUT API request
   * @param {*} values
   */
  const transformValueData = (values) => {
    const transformedObject = {
      matchId: setupData.RiotMatchId,
      week: values.week,
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
      },
    };

    /**
     * @param {string} color    'blue', 'red'
     */
    const loadBansIntoObject = (color) => {
      const bansList = [];
      for (let i = 0; i < NUMBER_OF_BANS; i += 1) {
        const numberValue = parseInt(values[`${color}TeamBanId${i}`], 10);
        if (numberValue && numberValue > 0) { // Did not ban / ban loss
          bansList.push(numberValue);
        }
      }
      const capitalColor = capitalize(color);
      transformedObject.teams[`${capitalColor}Team`].Bans = bansList;
    };

    /**
     * @param {string} color    'blue', 'red'
     */
    const loadPlayersIntoObject = (color) => {
      const playersList = [];
      for (let i = 0; i < NUMBER_OF_PLAYERS; i += 1) {
        playersList.push({
          Role: values[`${color}PlayerRole${i}`],
          ProfileName: values[`${color}PlayerName${i}`],
        });
      }
      const capitalColor = capitalize(color);
      transformedObject.teams[`${capitalColor}Team`].Players = playersList;
    };

    // BansList
    loadBansIntoObject(BLUE);
    loadBansIntoObject(RED);
    // PlayersList
    loadPlayersIntoObject(BLUE);
    loadPlayersIntoObject(RED);

    return transformedObject;
  };

  /**
   *
   * @param {string} teamName
   * @return {array}
   */
  const getPlayerList = (teamName) => {
    const profileNamesList = Object.keys(rosterData.Teams[teamName].Players);
    profileNamesList.push('');
    return profileNamesList.sort();
  };
  // #endregion

  // API data
  const [rosterData, setRosterData] = useState(null);
  // Form fields
  const [teamList, setTeamList] = useState([]);
  const [bluePlayerNameList, setBluePlayerNameList] = useState([]);
  const [redPlayerNameList, setRedPlayerNameList] = useState([]);
  const [blueBansList, setBlueBansList] = useState(initBansList(blueTeamSetupObject.Bans));
  const [redBansList, setRedBansList] = useState(initBansList(redTeamSetupObject.Bans));
  // Button states
  const [apiRequestSent, setApiRequestSent] = useState(false);
  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);
  const [saveButtonPressed, setSaveButtonPressed] = useState(false);
  // Validation list
  const [messageList, setMessageList] = useState([]);
  // Dropdown Weeks
  const [dropDownValue, setDropDownValue] = useState(setupData.Week);

  useEffect(() => {
    axios.get(`/api/season/v1/roster/name/${setupData.SeasonShortName}`)
      .then((res) => {
        setRosterData(res.data);
      }).catch((err) => {
        console.error(err);
        setRosterData({}); // Set to empty object
      });
  }, [setupData]);

  useEffect(() => {
    if (rosterData && Object.keys(rosterData).length > 0) {
      const newTeamList = Object.keys(rosterData.Teams).sort();
      setTeamList(newTeamList);
      if (blueTeamSetupObject.TeamName) {
        setBluePlayerNameList(getPlayerList(blueTeamSetupObject.TeamName));
      }
      if (redTeamSetupObject.TeamName) {
        setRedPlayerNameList(getPlayerList(redTeamSetupObject.TeamName));
      }
    }
    // eslint-disable-next-line
  }, [rosterData]);

  // #region Handlers
  /**
   * Formik's submit handler
   */
  const handleSubmit = async (values, {setSubmitting}) => {
    const callMatchSetupSubmit = () => {
      setApiRequestSent(true);
      axios.put('/api/match/v1/setup/submit',
        transformValueData(values)).then(() => {
        // Redirect link to new match link
        history.push(`/match/${setupData.RiotMatchId}`);
      }).catch((err) => {
        if (err.response.status === 500) {
          appendMessage('Setup Submit PUT request failed...');
        } else if (err.response.status === 403) {
          appendMessage('Forbidden access...');
        } else {
          const { data: { data } } = err.response;
          appendMessage(data.validateMessages);
        }
      }).finally(() => {
        setApiRequestSent(false);
        setSubmitButtonPressed(false);
        setSubmitting(false);
      });
    };
    const callMatchSetupSave = () => {
      setApiRequestSent(true);
      axios.put('/api/match/v1/setup/save', transformValueData(values)).then(() => {
        appendMessage('Setup saved!');
      }).catch((err) => {
        if (err.response.status === 403) {
          appendMessage('Forbidden access...');
        } else {
          appendMessage('Setup Submit PUT request failed...');
        }
      }).finally(() => {
        setApiRequestSent(false);
        setSaveButtonPressed(false);
        setSubmitting(false);
      });
    };

    setMessageList([]);
    if (submitButtonPressed) {
      callMatchSetupSubmit();
    } else if (saveButtonPressed) {
      callMatchSetupSave();
    }
  };

  /**
   * OnBlur handler to check if ban value was changed
   * @param {number} newBan
   * @param {string} color
   * @param {number} index
   */
  const handleBanBlur = (color, index, newBanId) => {
    const thisBansList = (color === BLUE) ? blueBansList : redBansList;
    if (thisBansList[index] !== newBanId) {
      const newBansList = [...thisBansList];
      newBansList[index] = newBanId;
      if (color === BLUE) {
        setBlueBansList(newBansList);
      } else {
        setRedBansList(newBansList);
      }
    }
  };

  /**
   * onChange handler to update the players list
   * @param {string} color
   * @param {string} teamName
   * @param {function} setFieldValue
   */
  const handleTeamChange = (color, teamName, setFieldValue) => {
    if (color === BLUE) {
      setFieldValue('blueTeamName', teamName);
      // Clear Fields for Players
      for (let i = 0; i < NUMBER_OF_PLAYERS; i += 1) {
        setFieldValue(`bluePlayerName${i}`, '');
      }
      setBluePlayerNameList(getPlayerList(teamName));
    } else if (color === RED) {
      setFieldValue('redTeamName', teamName);
      // Clear Fields for Players
      for (let i = 0; i < NUMBER_OF_PLAYERS; i += 1) {
        setFieldValue(`redPlayerName${i}`, '');
      }
      setRedPlayerNameList(getPlayerList(teamName));
    }
  };
  // #endregion

  // #region JSX functions
  /**
   * @param {Array} playerList    Object of Players from Match GET Request 'Setup'
   * @param {string} color        Either 'blue' or 'red'
   * @param {object} classes      Material-UI css class
   */
  const playerTableFields = (playerList, color, classes) => {
    const rolesList = ['Top', 'Jungle', 'Middle', 'Bottom', 'Support'];
    const playersList = (color === BLUE) ? bluePlayerNameList :
      (color === RED) ? redPlayerNameList : 
      [];

    return (
      <table>
        <tbody>
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
                  select
                  variant="filled"
                  style={{
                    minWidth: 350,
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                >
                  {playersList.map((name, idx) => (
                    <MenuItem key={`${color}PlayerNameItem-${idx}`} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Field>
              </td>
              <td>
                <Field
                  component={TextField}
                  type={`${color}PlayerRole${idx}`}
                  name={`${color}PlayerRole${idx}`}
                  select
                  style={{
                    minWidth: 100,
                  }}
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
        </tbody>
      </table>
    );
  };

  /**
   *
   * @param {Array} banList
   * @param {string} color
   * @param {object} classes
   */
  const bansTableFields = (banList, color, classes) => {
    return (
      <table>
        <tbody>
          <tr key={`${color}TeamBanImages`}>
            {banList.map((banId, idx) => (
              <td key={`${color}TeamBanImage${idx}`}>
                {(banId && banId > 0) ? (
                  <ChampionSquare
                    id={banId}
                    width="45"
                    height="45"
                  />
                ) : <div />}
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
                    style: { textAlign: 'center' },
                  }}
                  onBlur={(event) => {
                    handleBanBlur(color, idx, event.target.value);
                  }}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    );
  };
  // #endregion

  const changeValue = (text) => {
    setDropDownValue(text);
  }

  const weekList = [
    '',
    'W1',
    'W2',
    'W3',
    'W4',
    'W5',
    'W6',
    'W7',
    'PI1',
    'PI2',
    'PI3',
    'RO16',
    'RO12',
    'QF',
    'SF',
    'F',
  ];

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <h1 className={classes.title}>
              {setupData.TournamentName}
              <br />
              {setupData.RiotMatchId}
            </h1>
            {!rosterData && (
            <div>
              <b>Loading Roster Data...</b>
              <br />
            </div>
            )}
            {teamList.length > 0
            && (!(blueTeamSetupObject?.TeamName) || bluePlayerNameList.length > 0
            || (blueTeamSetupObject?.TeamName && bluePlayerNameList.length === 0))
            && (!(redTeamSetupObject?.TeamName) || redPlayerNameList.length > 0
            || (redTeamSetupObject?.TeamName && redPlayerNameList.length === 0)) 
            && (
            <Formik
              initialValues={{
                week: setupData.Week || '',
                blueTeamName:  blueTeamSetupObject?.TeamName || '',
                redTeamName: redTeamSetupObject?.TeamName || '',
                bluePlayerName0: blueTeamSetupObject?.Players[0]?.ProfileName || '',
                bluePlayerName1: blueTeamSetupObject?.Players[1]?.ProfileName || '',
                bluePlayerName2: blueTeamSetupObject?.Players[2]?.ProfileName || '',
                bluePlayerName3: blueTeamSetupObject?.Players[3]?.ProfileName || '',
                bluePlayerName4: blueTeamSetupObject?.Players[4]?.ProfileName || '',
                bluePlayerRole0: blueTeamSetupObject?.Players[0]?.Role || '',
                bluePlayerRole1: blueTeamSetupObject?.Players[1]?.Role || '',
                bluePlayerRole2: blueTeamSetupObject?.Players[2]?.Role || '',
                bluePlayerRole3: blueTeamSetupObject?.Players[3]?.Role || '',
                bluePlayerRole4: blueTeamSetupObject?.Players[4]?.Role || '',
                redPlayerName0: redTeamSetupObject?.Players[0]?.ProfileName || '',
                redPlayerName1: redTeamSetupObject?.Players[1]?.ProfileName || '',
                redPlayerName2: redTeamSetupObject?.Players[2]?.ProfileName || '',
                redPlayerName3: redTeamSetupObject?.Players[3]?.ProfileName || '',
                redPlayerName4: redTeamSetupObject?.Players[4]?.ProfileName || '',
                redPlayerRole0: redTeamSetupObject?.Players[0]?.Role || '',
                redPlayerRole1: redTeamSetupObject?.Players[1]?.Role || '',
                redPlayerRole2: redTeamSetupObject?.Players[2]?.Role || '',
                redPlayerRole3: redTeamSetupObject?.Players[3]?.Role || '',
                redPlayerRole4: redTeamSetupObject?.Players[4]?.Role || '',
                blueTeamBanId0: blueTeamSetupObject?.Bans[0] || '',
                blueTeamBanId1: blueTeamSetupObject?.Bans[1] || '',
                blueTeamBanId2: blueTeamSetupObject?.Bans[2] || '',
                blueTeamBanId3: blueTeamSetupObject?.Bans[3] || '',
                blueTeamBanId4: blueTeamSetupObject?.Bans[4] || '',
                redTeamBanId0: redTeamSetupObject?.Bans[0] || '',
                redTeamBanId1: redTeamSetupObject?.Bans[1] || '',
                redTeamBanId2: redTeamSetupObject?.Bans[2] || '',
                redTeamBanId3: redTeamSetupObject?.Bans[3] || '',
                redTeamBanId4: redTeamSetupObject?.Bans[4] || '',
              }}
              validate={() => {}}
              onSubmit={handleSubmit}
            >
              {({ setFieldValue }) => (
                <Form>
                  <span><b>Week</b></span>
                  <span>
                    <DropdownButton title={dropDownValue} id="weekDropDown" name="week">
                      {weekList.map((week) => (
                        <Dropdown.Item key={week} as="button"><div onClick={(e) => changeValue(e.target.textContent)}>{week}</div></Dropdown.Item>
                      ))}
                    </DropdownButton>
                  </span>
                  <table>
                    <thead>
                      <tr className={classes.rowTeam}>
                        <td className={classes.colBlueTeam}>
                          <u>Blue Team Name</u>
                          <br />
                          <Field
                            component={TextField}
                            type="blueTeamName"
                            name="blueTeamName"
                            select
                            className={classes.textField}
                            variant="filled"
                            style={{
                              minWidth: 350,
                              textAlign: 'center',
                            }}
                            inputProps={{ min: 0 }}
                            onChange={(event) => {
                              handleTeamChange(BLUE, event.target.value, setFieldValue);
                            }}
                          >
                            {teamList.map((teamName, idx) => (
                              <MenuItem
                                key={`blueTeamNameItem-${idx}`}
                                value={teamName}
                              >
                                {teamName}
                              </MenuItem>
                            ))}
                          </Field>
                        </td>
                        <td className={classes.colRedTeam}>
                          <u>Red Team Name</u>
                          <br />
                          <Field
                            component={TextField}
                            type="redTeamName"
                            name="redTeamName"
                            select
                            className={classes.textField}
                            variant="filled"
                            style={{
                              minWidth: 350,
                              textAlign: 'center',
                            }}
                            inputProps={{ min: 0 }}
                            onChange={(event) => {
                              handleTeamChange(RED, event.target.value, setFieldValue);
                            }}
                          >
                            {teamList.map((teamName, idx) => (
                              <MenuItem
                                key={`redTeamNameItem-${idx}`}
                                value={teamName}
                                width={350}
                              >
                                {teamName}
                              </MenuItem>
                            ))}
                          </Field>
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={classes.rowBody}>
                        <td className={classes.colBody} id="bluePlayers">
                          {playerTableFields(blueTeamSetupObject?.Players, BLUE, classes)}
                        </td>
                        <td className={classes.colBody} id="redPlayers">
                          {playerTableFields(redTeamSetupObject?.Players, RED, classes)}
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
                    disabled={apiRequestSent}
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
                    disabled={apiRequestSent}
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
              )}
            </Formik>
            )}
            <h2 className={classes.title}>
              {messageList.map((message, idx) => (
                <React.Fragment key={idx}>
                  <div className="error-message">
                    {message}
                    <br />
                  </div>
                </React.Fragment>
              ))}
            </h2>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

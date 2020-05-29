import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
// Components
import TeamScouting from './TeamScouting';
import TeamGameLog from './TeamGameLog';
import Dragdown from '../Dragdown';

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
    tab: {
        backgroundColor: '#DCDCDC',
    },
    colTitle: {
        width: "80%",
        textAlign: 'left',
        fontSize: 'x-large',
    },
    colDragdown: {
        width: "20%",
        textAlign: 'right',
    },
}));

function TabPanel(props) {
    const { className, children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box>
                    <Typography component={'span'}>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

export default function TeamGamesWrapper({ info, scouting, games }) {
    const classes = useStyles();
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    let scoutingComponent = (<TeamScouting scouting={scouting} />);
    let gamesComponent = (<TeamGameLog games={games} />);

    return (<div>
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper className={classes.paper}>
                    <table>
                        <tbody>
                            <tr>
                                <td className={classes.colTitle}>
                                    <Link to={`/season/${games.SeasonShortName}`}><b>{games.SeasonName} Season</b></Link>
                                </td>
                                <td className={classes.colDragdown}>
                                <Dragdown 
                                    list={info.SeasonList} 
                                    basePath={`/team/${info.TeamName}/games`}
                                    type="Teams"
                                    title={games.SeasonTime}
                                />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <br />
                    <Tabs
                        value={value}
                        className={classes.tab}
                        onChange={handleChange}
                        indicatorColor="secondary"
                        textColor="secondary"
                        variant="fullWidth"
                        centered
                    >
                        <Tab label="Game Log" />
                        <Tab label="Scouting" />
                    </Tabs>
                    <TabPanel value={value} index={0}>
                        {gamesComponent}
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        {scoutingComponent}
                    </TabPanel>
                </Paper>
            </Grid>
        </Grid>
    </div>)
}
import React from 'react';
import PropTypes from 'prop-types';
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

function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                <Typography>{children}</Typography>
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
  
function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

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
        backgroundColor: theme.palette.text.disabled,
    },
}));

export default function TeamGamesWrapper({ info, scouting, games }) {
    const classes = useStyles();
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    let scoutingComponent = (<TeamScouting scouting={scouting} seasonList={info.SeasonList} />);
    let gamesComponent = (<TeamGameLog games={games} seasonList={info.SeasonList} />);

    return (
        <div>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <Dragdown 
                            list={info.SeasonList} 
                            basePath={`/team/${info.TeamName}/games`}
                            type="Teams"
                            title={games.SeasonTime}
                        />
                        <p></p>
                        <Tabs
                            value={value}
                            className={classes.tab}
                            onChange={handleChange}
                            indicatorColor="primary"
                            textColor="inherit"
                            variant="fullWidth"
                            centered
                        >
                            <Tab label="Scouting" {...a11yProps(0)} />
                            <Tab label="Game Log" {...a11yProps(1)} />
                        </Tabs>
                        <TabPanel value={value} index={0}>
                            {scoutingComponent}
                        </TabPanel>
                        <TabPanel value={value} index={1}>
                            {gamesComponent}
                        </TabPanel>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    )
}
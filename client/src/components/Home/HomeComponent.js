import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// Component
import HelmetComponent from '../Helmet/HelmetComponent';
import LeagueTable from './LeagueTable';

const useStyles = makeStyles((theme) => ({
    paper: {
        height: "100%",
        padding: theme.spacing(2),
        display: "flex",
        flexDirection: "column",
        color: theme.palette.text.primary,
        background: '#A9A9A9',
    },
    title: {
        padding: theme.spacing(1),
        fontWeight: 'bold',
    },
    imgSpacing: {
        display: 'block',
        marginLeft: 'auto',
        marginRight: 'auto',        
        padding: theme.spacing(1),
    },
    row: {
        padding: theme.spacing(2),
    },
    header: {
        fontSize: 'large',
        fontWeight: 'bold',
        textAlign: 'middle'
    },
    columns: {
        width: "33%",
        textAlign: 'middle',
    }
}));

export default function HomeComponent({ leagueData }) {
    const classes = useStyles();

    return (<div>
        <HelmetComponent
            description="Stats website for LoL tournaments by Doowan"
        />
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper className={classes.paper}>
                    <h1 className={classes.title}><u>Stats Website for LoL tournaments by Doowan</u></h1><br />
                    <p>
                        Hello players (and recruiters who found this website through my resume or LinkedIn).
                    </p>
                    <p>
                        This MERN full stack website was designed with the goal to provide competitive players a resource to scout 
                        teams and analyze their own performance. This resource is meant to fit my customers first mentality, and provide 
                        an experience to players that will advance competition and improvement. The entire website was designed by me, with the beginning 
                        of additional help from a few developers. If you are interested in helping to develop this website further, please contact
                        me on Discord at doowan#8888.
                    </p>
                </Paper>
            </Grid>
            <Grid item xs={12}>
                <LeagueTable seasonList={leagueData} />
            </Grid>
        </Grid>
    </div>);
}
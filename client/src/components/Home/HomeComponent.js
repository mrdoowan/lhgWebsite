import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// Component
import HelmetComponent from '../Helmet/HelmetComponent';

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

export default function HomeComponent() {
    const classes = useStyles();

    return (<div>
        <HelmetComponent
            title="LHG Competitive Leagues"
            description="The main site for LHG Competitive Leagues"
            image="https://lhg-images.s3.us-east-2.amazonaws.com/LHG_S2020_Logo.png"
        />
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper className={classes.paper}>
                    <img src='https://lhg-images.s3.us-east-2.amazonaws.com/LHG_S2020_Logo.png' className={classes.imgSpacing} alt='LHG Logo' width="300" height="300" />
                    <p className={classes.title}><h1><u>LHG Competitive Leagues (Public Beta Website)</u></h1></p>
                    <p>
                        Welcome to the Public Beta website of LHG's (Last Hit God) Competitive Leagues for League of Legends tournaments! 
                        As with all Public Betas, many features are incomplete and are still in process of being implemented. In the meantime, 
                        we have enough to allow teams to properly scout each other based on their previous matches and also display some awesome stats!
                        Any feedback is appreciated.
                    </p>
                    <table>
                        <thead>
                            <tr className={classes.row}>
                                <td className={classes.header}>Join the league on Discord!</td>
                                <td className={classes.header}>Watch our games on Twitch!</td>
                                <td className={classes.header}>Follow us on Twitter!</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className={classes.row}>
                                <td className={classes.columns}><a href='https://discord.gg/dhHBxfA'><img src='https://lhg-images.s3.us-east-2.amazonaws.com/discord_logo.png' className={classes.imgSpacing} alt='Discord Logo' width="100" height="100"/></a></td>
                                <td className={classes.columns}><a href='https://www.twitch.tv/lasthitgods'><img src='https://lhg-images.s3.us-east-2.amazonaws.com/twitch_logo.png' className={classes.imgSpacing} alt='Twitch Logo' width="100" height="100"/></a></td>
                                <td className={classes.columns}><a href='https://twitter.com/LastHitGods'><img src='https://lhg-images.s3.us-east-2.amazonaws.com/twitter_logo.png' className={classes.imgSpacing} alt='Twitter Logo' width="100" height="100"/></a></td>
                            </tr>
                        </tbody>
                    </table>
                    <p>
                        <b>
                            We are always recruiting Casters, Moderators, Graphic Designers, and Software Developers on a volunteer basis! <br />
                            If you are interested in helping out to improve LHG, please fill out the form below!
                        </b>
                    </p>
                    <a href='https://forms.gle/KSpW2fMLLz18iioN9'><img src='https://lhg-images.s3.us-east-2.amazonaws.com/google_forms_icon.png' className={classes.imgSpacing} alt='Google Form Logo' width="100" height="100"/></a>
                </Paper>
            </Grid>
        </Grid>
    </div>);
}
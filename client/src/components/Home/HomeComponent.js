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
            description="The stats website for leagues hosted by Doowan"
        />
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper className={classes.paper}>
                    <h1 className={classes.title}><u>Stats Website for Leagues Hosted by Doowan</u></h1><br />
                    <p>
                        (Description of myself)
                    </p>
                </Paper>
            </Grid>
        </Grid>
    </div>);
}
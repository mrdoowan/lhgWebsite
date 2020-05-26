import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
// Components
import ProfileTab from './ProfileTab';

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.primary,
        background: '#A9A9A9',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 'x-large',
    },
}));

export default function ProfileHeader({ info, type }) {
    const classes = useStyles();

    let titleMarkUp = (
        <div className={classes.title}>
            <p>{info.ProfileName}</p>
        </div>
    );
    let profileBar = ( <ProfileTab name={info.ProfileName} type={type} /> );
    
    return (
        <div>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        {titleMarkUp}
                        {profileBar}
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}
import React from 'react';
import { Link } from 'react-router-dom';
// MUI
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    title: {
        fontSize: 'x-large',
        fontWeight: 'bold',
    },
    season: {
        padding: theme.spacing(1),  
        fontWeight: 'bold',
    },
    blueTeam: {
        color: 'blue',
    },
    redTeam: {
        color: 'red',
    }
}));

export default function MatchTitle({ match }) {
    const classes = useStyles();

    let blueName = match.Teams["100"].TeamName;
    let redName = match.Teams["200"].TeamName;

    let blueTeamLink = (<Link className={classes.blueTeam} to={`/team/${blueName}`}>{blueName}</Link>);
    let redTeamLink = (<Link className={classes.redTeam} to={`/team/${redName}`}>{redName}</Link>);

    return (
        <div>
            <p className={classes.title}>{blueTeamLink} VS {redTeamLink}</p>
            <p className={classes.season}><Link to={`/season/${match.SeasonShortName}`}>{match.SeasonName}</Link></p>
        </div>
    );
}
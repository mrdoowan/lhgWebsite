import React from 'react';
import { Link } from 'react-router-dom';
// MUI
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    alignItemsAndJustifyContent: {
        width: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 'auto',
    },
}));

export default function TourneyTab({ shortName, type }) {
    const classes = useStyles();
    const tabList = [ 
        { 
            text: 'Tournament',
            url: '',
        },
        {
            text: 'Champs',
            url: '/pickbans',
        },
        {
            text: 'Players',
            url: '/players',
        },
        {
            text: 'Teams',
            url: '/teams',
        },
        {
            text: 'Games',
            url: '/games',
        }
    ];

    return (
    <div className={classes.root}>
        <ButtonGroup>{tabList.map((tab) => (
            <Button variant="contained" color={isPrimary(type, tab.text)} component={Link} to={`/tournament/${shortName}${tab.url}`}>{tab.text}</Button>
        ))}
        </ButtonGroup>
    </div>
    );
}

function isPrimary(type, text) {
    return (type === text) ? 'primary' : 'secondary';
}
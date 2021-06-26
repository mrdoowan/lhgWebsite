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

export default function TeamTab({ name, type }) {
  const classes = useStyles();
  const tabList = [
    {
      text: 'Team',
      url: '',
    },
    {
      text: 'Games',
      url: '/games',
    },
    {
      text: 'Stats',
      url: '/stats',
    },
  ];

  return (
    <div className={classes.root}>
      <ButtonGroup>
        {tabList.map((tab) => (
          <Button
            key={tab.text.toLowerCase()}
            variant="contained"
            color={isPrimary(type, tab.text)}
            component={Link}
            to={`/team/${name}${tab.url}`}
          >
            {tab.text}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
}

function isPrimary(type, text) {
  return (type === text) ? 'primary' : 'secondary';
}

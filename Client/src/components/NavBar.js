import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';

// MUI
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#2196f3',
        },
        secondary: {
            main: '#009688',
        },
        contrastThreshold: 3,
    },
});

class NavBar extends Component {
    render() {
        return (
            <MuiThemeProvider theme={theme}>
            <AppBar>
                <Toolbar className="nav-container">
                    <Button color="inherit" component={Link} to="/">Home</Button>
                    <Button color="inherit" component={Link} to="/about">About</Button>
                    <Button color="inherit" component={Link} to="/leagues">Leagues</Button>
                    <Button color="inherit" component={Link} to="/schedule">Schedule</Button>
                </Toolbar>
            </AppBar>
            </MuiThemeProvider>
        );
    }
}

export default NavBar;
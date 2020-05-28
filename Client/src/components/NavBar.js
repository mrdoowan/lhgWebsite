import React, { Component } from 'react';
import { Link } from 'react-router-dom';

// MUI
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#2196f3',
        },
        secondary: {
            main: '#2196f3',
        },
        contrastThreshold: 3,
    },
});

class NavBar extends Component {
    render() {
        return (
            <ThemeProvider theme={theme}>
            <AppBar>
                <Toolbar className="nav-container">
                    <Button color="inherit" component={Link} to="/">Home</Button>
                    <Button color="inherit" component={Link} to="/about">About</Button>
                    <Button color="inherit" component={Link} to="/leagues">Leagues</Button>
                    <Button color="inherit" component={Link} to="/schedule">Schedule</Button>
                </Toolbar>
            </AppBar>
            </ThemeProvider>
        );
    }
}

export default NavBar;
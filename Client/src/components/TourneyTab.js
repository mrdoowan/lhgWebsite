import React from 'react';
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
            main: '#607d8b',
        },
        secondary: {
            main: '#009688',
        },
        contrastThreshold: 4,
    }
});

export default function TourneyTab({ shortName }) {
    return (
        <MuiThemeProvider theme={theme}>
            <AppBar position="fixed" component="body">
                <Toolbar className="nav-container">
                    <Button color="inherit" component={Link} to={`/tournament/${shortName}`}>Tournament</Button>
                    <Button color="inherit" component={Link} to={`/tournament/${shortName}/pickbans`}>Champs</Button>
                    <Button color="inherit" component={Link} to={`/tournament/${shortName}/players`}>Players</Button>
                    <Button color="inherit" component={Link} to={`/tournament/${shortName}/teams`}>Teams</Button>
                </Toolbar>
            </AppBar>
            <Toolbar />
        </MuiThemeProvider>
    );
}
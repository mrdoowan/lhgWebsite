import React, { Component } from 'react';
import { Link } from 'react-router-dom';

// MUI
import AppBar from "@material-ui/core/AppBar"
import Toolbar from "@material-ui/core/Toolbar"
import Button from "@material-ui/core/Button"

class NavBar extends Component {
    render() {
        return (
            <AppBar>
                <Toolbar className="nav-container">
                    <Button color="inherit" component={Link} to="/">Home</Button>
                    <Button color="inherit" component={Link} to="/about">About</Button>
                    <Button color="inherit" component={Link} to="/leagues">Leagues</Button>
                    <Button color="inherit" component={Link} to="/schedule">Schedule</Button>
                </Toolbar>
            </AppBar>
        );
    }
}

export default NavBar;
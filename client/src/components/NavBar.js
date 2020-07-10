import React, { Component } from 'react';
import { withRouter } from 'react-router';
// MUI
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import InputBase from '@material-ui/core/InputBase';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { fade } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
// react-bootstrap
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

const muiTheme = createMuiTheme({
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

const styles = theme => ({
    menu: {
        margin: '0 auto',
        display: 'flex',
        color: 'white',
        maxWidth: '1300px',
    },
    menuFirstItem: {
        position: 'relative',
        height: '100%',
        display: 'flex',
        fontSize: '15px',
    },
    menuItem: {
        position: 'relative',
        height: '100%',
        display: 'flex',
        marginLeft: '20px',
    },
    searchBar: {
        position: 'relative',
        display: 'flex',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        [theme.breakpoints.up('sm')]: {
            marginLeft: '50px',
            width: 'auto',
        },
    },
    searchForm: {
        position: 'relative',
        display: 'flex',
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: '10px 8px 8px 0px',
        // vertical padding + font size from searchIcon
        paddingLeft: '1em',
        transition: theme.transitions.create('width'),
        width: '100%',
    },
    searchIcon: {
        position: 'relative',
        display: 'flex',
        padding: '7px 5px 5px 7px',
    },
});

class NavBar extends Component {
    constructor() {
        super();
    
        this.state = {
            dropDownValue: "Profile",
            searchField: "",
        }
    }

    changeValue(text) {
        this.setState({dropDownValue: text})
    }

    handleSearchChange = (e) => {
        this.setState({ searchField: e.target.value })
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.history.push(`/${this.state.dropDownValue.toLowerCase()}/${this.state.searchField.toLowerCase()}`);
        // Below is to force rerendering zzz
        window.location.href = `/${this.state.dropDownValue.toLowerCase()}/${this.state.searchField.toLowerCase()}`;
        this.setState({ searchField: '' });
    }

    itemList = [
        'Profile',
        'Team',
    ]

    render() {
        const { classes } = this.props;

        return (
            <ThemeProvider theme={muiTheme}>
            <AppBar>
                <Toolbar className={classes.menu}>
                    <Button color="inherit" href="/" className={classes.menuFirstItem}>Home</Button>
                    {/* <Button color="inherit" component={Link} to="/about">About</Button> */}
                    <Button color="inherit" href="/leagues" className={classes.menuItem}>Leagues</Button>
                    <Button color="inherit" href="/season/s2020cl" className={classes.menuItem}>LHGCL</Button>
                    <Button color="inherit" href="/season/s2020pl" className={classes.menuItem}>LHGPL</Button>
                    <Button color="inherit" href="/season/s2020al" className={classes.menuItem}>LHGAL</Button>
                    {/* <Button color="inherit" component={Link} to="/schedule">Schedule</Button> */}
                    <div className={classes.searchBar}>
                        <DropdownButton title={this.state.dropDownValue} id="NavBarSearch">
                            {this.itemList.map((item) => (
                                <Dropdown.Item key={item} as="button"><div onClick={(e) => this.changeValue(e.target.textContent)}>{item}</div></Dropdown.Item>
                            ))}
                        </DropdownButton>
                        <form className={classes.searchForm} onSubmit={this.handleSubmit}>
                            <InputBase 
                                placeholder="Search..."
                                classes={{
                                    root: classes.inputRoot,
                                    input: classes.inputInput,
                                }}
                                inputProps={{ 'aria-label': 'search' }}
                                value={this.state.searchField}
                                onChange={this.handleSearchChange}
                            />
                            <IconButton type="submit" className={classes.searchIcon} aria-label="search" >
                                <SearchIcon />
                            </IconButton>
                        </form>
                    </div>
                </Toolbar>
            </AppBar>
            </ThemeProvider>
        );
    };
}

NavBar.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(NavBar));
import React, { useState } from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import InputBase from '@material-ui/core/InputBase';
import { alpha } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
// react-bootstrap
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

const useStyles = makeStyles((theme) => ({
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
    color: 'black',
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
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
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
    color: 'black',
  },
  searchIcon: {
    position: 'relative',
    display: 'flex',
    padding: '7px 5px 5px 7px',
  },
}));

export default function NavBar() {
  const classes = useStyles();
  // Init State
  const [dropDownValue, setDropDownValue] = useState("Profile");
  const [searchField, setSearchField] = useState("");

  const changeValue = (text) => {
    setDropDownValue(text);
  }

  const handleSearchChange = (e) => {
    setSearchField(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    // Below is to force rerendering zzz
    window.location.href = `/${dropDownValue.toLowerCase()}/${searchField.toLowerCase()}`;
    setSearchField('');
  }

  const itemList = [
    'Profile',
    'Team',
  ]

  return (
    <AppBar>
      <Toolbar className={classes.menu}>
        <Button color="inherit" href="/" className={classes.menuFirstItem}>Home</Button>
        <div className={classes.searchBar}>
          <DropdownButton title={dropDownValue} id="NavBarSearch">
            {itemList.map((item) => (
              <Dropdown.Item key={item} as="button"><div onClick={(e) => changeValue(e.target.textContent)}>{item}</div></Dropdown.Item>
            ))}
          </DropdownButton>
          <form className={classes.searchForm} onSubmit={handleSubmit}>
            <InputBase
              placeholder="Search..."
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'search' }}
              value={searchField}
              onChange={handleSearchChange}
            />
            <IconButton type="submit" className={classes.searchIcon} aria-label="search" >
              <SearchIcon />
            </IconButton>
          </form>
        </div>
      </Toolbar>
    </AppBar>
  );
}
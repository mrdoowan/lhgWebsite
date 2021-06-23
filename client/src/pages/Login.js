import React, { Component } from "react";
// MUI
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { Helmet } from "react-helmet";

const styles = (theme) => ({
  root: {
    margin: theme.spacing(1),
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.primary,
    background: '#A9A9A9',
  },
  title: {
    margin: '10px auto 10px auto',
  },
  textField: {
    margin: '10px auto 10px auto',
    width: '30%',
  },
  button: {
    margin: '20px auto auto auto',
  }
});

class login extends Component {
  state = {
    profile: '',
    password: '',
    loading: false,
    errors: {},
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({
      loading: true,
    });
  };
  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  render() {
    const { classes } = this.props;

    return (<div>
      <Helmet>
        <title>Login - Doowan Stats</title>
        <meta name="description" content="Admin Login to Doowan Stats" />
      </Helmet>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant="h4" className={classes.title}>
              Login for Mods / Admins
            </Typography>
            <form className={classes.root} noValidate onSubmit={this.handleSubmit}>
              <TextField
                id="profile"
                type="profile"
                name="profile"
                label="Profile"
                value={this.state.profile}
                onChange={this.handleChange}
                className={classes.textField}
                fullWidth
              />
              <br />
              <TextField
                id="password"
                type="password"
                name="password"
                label="Password"
                value={this.state.password}
                onChange={this.handleChange}
                className={classes.textField}
                fullWidth
              />
              <br />
              <Button type="submit" variant="contained" color="secondary" className={classes.button}>
                Login
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </div>);
  }
}

export default withStyles(styles)(login);

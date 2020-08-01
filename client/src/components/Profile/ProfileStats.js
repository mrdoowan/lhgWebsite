import React, { Component } from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';

const styles = makeStyles((theme) => ({
    paper: {
        height: "100%",
        padding: theme.spacing(1),
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        color: theme.palette.text.primary,
        background: '#A9A9A9',
    },
    title: {
        marginTop: theme.spacing(2),
        'text-decoration': 'bold',
        fontSize: 'large',
    },
}));

class profileStats extends Component {
    

    render() {
        const { classes } = this.props;

        return (<div>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <p className={classes.title}>Player Stats Log Coming Soon!</p>
                        {/* <table><tbody>
                            <tr>
                                
                            </tr>
                        </tbody></table> */}
                    </Paper>
                </Grid>
            </Grid>
        </div>)
    };
}

profileStats.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(profileStats);
import React from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.primary,
        background: '#A9A9A9',
        'font-weight': 'bold',
    },
    title: {
        padding: theme.spacing(2),
        fontSize: 'large',
    },
    pad: {
        padding: theme.spacing(2),
    },
}));

const TourneyUpdate = ({ 
    infoData,
    loading,
    playerNumber,
    teamNumber,
    gameNumber,
    handleUpdateTournament = () => {},
}) => {
    const classes = useStyles();
    
    const buttonComponents = (<form onSubmit={handleUpdateTournament}>
        <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
        >
            Update
        </Button>
    </form>);

    const loadingComponent = (loading) ? (<div className={classes.pad}>
        <CircularProgress color="secondary" />
    </div>) : (<div></div>);
    
    const responseReceived = (<div className={classes.pad}>
        {(playerNumber) ? (<React.Fragment>{playerNumber} Players updated<br /></React.Fragment>) : '' }
        {(teamNumber) ? (<React.Fragment>{teamNumber} Teams updated<br /></React.Fragment>) : '' }
        {(gameNumber) ? (<React.Fragment>{gameNumber} Games updated<br /></React.Fragment>) : '' }
        {(playerNumber && teamNumber && gameNumber) ? 
            (<React.Fragment>Finished! Remember to Stop the RDS Database.<br /></React.Fragment>) : '' }
    </div>);

    return (
        <div>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <div className={classes.title}>The Forbidden page to update "{infoData.TournamentName}" overall stats</div>
                        {buttonComponents}
                        {loadingComponent}
                        {responseReceived}
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}

export default TourneyUpdate;
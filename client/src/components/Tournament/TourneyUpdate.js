import React, { useState, useEffect } from 'react';
// MUI
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
// Import Services
import { AWS_RDS_STATUS } from '../../../../services/Constants';
import { 
    checkRdsStatus,
    stopRdsInstance,
} from '../../../../functions/apiV1/dependencies/awsRdsHelper';

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
    const [rdsNotAvailableMessage, setRdsNotAvailableMessage] = useState(false);

    const handleSubmit = (event) => {
        setRdsNotAvailableMessage(false);
        checkRdsStatus().then((status) => {
            if (status === AWS_RDS_STATUS.AVAILABLE) {
                handleUpdateTournament(event);
            }
            else {
                setRdsNotAvailableMessage(true);
            }
        });
    }
    
    // Call the stopRdsInstance after update is finished
    useEffect(() => {
        if (playerNumber && teamNumber && gameNumber) {
            stopRdsInstance();
        }
    }, [playerNumber, teamNumber, gameNumber]);

    const buttonComponents = (<form onSubmit={handleSubmit}>
        <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={disableUpdateButton}
        >
            Update
        </Button>
    </form>);

    const loadingComponent = (loading) ? (<div className={classes.pad}>
        <CircularProgress color="secondary" />
    </div>) : (<div></div>);
    
    const responseReceived = (<div className={classes.pad}>
        {(rdsNotAvailableMessage) ? (<React.Fragment>RDS Database Not Available! Check AWS.<br /></React.Fragment>) : '' }
        {(playerNumber) ? (<React.Fragment>{playerNumber} Players updated<br /></React.Fragment>) : '' }
        {(teamNumber) ? (<React.Fragment>{teamNumber} Teams updated<br /></React.Fragment>) : '' }
        {(gameNumber) ? (<React.Fragment>{gameNumber} Games updated<br /></React.Fragment>) : '' }
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
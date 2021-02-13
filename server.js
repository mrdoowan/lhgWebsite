// Preload environmental variables in ES6
import _ from './env';
// Import Routes
import authV1Routes from './routes/apiV1/authRoutes.js';
import leagueV1Routes from './routes/apiV1/leagueRoutes.js';
import seasonV1Routes from './routes/apiV1/seasonRoutes.js';
import tournamentV1Routes from './routes/apiV1/tournamentRoutes.js';
import profileV1Routes from './routes/apiV1/profileRoutes.js';
import teamV1Routes from './routes/apiV1/teamRoutes.js';
import matchV1Routes from './routes/apiV1/matchRoutes.js';
import staffV1Routes from './routes/apiV1/staffRoutes.js';
import { AWS_RDS_STATUS } from './services/Constants';
import { checkRdsStatus, stopRdsInstance } from './functions/apiV1/dependencies/awsRdsHelper';
//console.log(_.OLD_PROFILE_HID_SALT);

/*  Declaring npm modules */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;
const schedule = require('node-schedule');

// Configure express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(redirectToHTTPS([/localhost:(\d{4})/], [/\/insecure/], 301));

// Use Routes
app.use('/api/auth/v1', authV1Routes);
app.use('/api/leagues/v1', leagueV1Routes);
app.use('/api/season/v1', seasonV1Routes);
app.use('/api/tournament/v1', tournamentV1Routes);
app.use('/api/profile/v1', profileV1Routes);
app.use('/api/team/v1', teamV1Routes);
app.use('/api/match/v1', matchV1Routes);
app.use('/api/staff/v1', staffV1Routes);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

// Check if the MySQL Db is "Available" every hour. If so, stop the instance.
schedule.scheduleJob('00 * * * *', function(){
    checkRdsStatus().then((status) => {
        if (status === AWS_RDS_STATUS.AVAILABLE) {
            stopRdsInstance().then(() => {
                console.log(`Stopping AWS RDS instances`);
            }).catch((err) => {
                console.error(err, err.stack);
            });
        }
    })
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Stats server started on port ${port}`));
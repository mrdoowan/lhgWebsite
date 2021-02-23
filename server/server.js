// Preload environmental variables in ES6
import _ from '../env';
// Import for deployment
import "core-js/stable";
import "regenerator-runtime/runtime";
// Import Routes
import authV1Routes from './routes/apiV1/authRoutes.js';
import leagueV1Routes from './routes/apiV1/leagueRoutes.js';
import seasonV1Routes from './routes/apiV1/seasonRoutes.js';
import tournamentV1Routes from './routes/apiV1/tournamentRoutes.js';
import profileV1Routes from './routes/apiV1/profileRoutes.js';
import teamV1Routes from './routes/apiV1/teamRoutes.js';
import matchV1Routes from './routes/apiV1/matchRoutes.js';
import staffV1Routes from './routes/apiV1/staffRoutes.js';
import { AWS_RDS_STATUS, RDS_TYPE } from './services/constants';
import { checkRdsStatus, stopRdsInstance } from './functions/apiV1/dependencies/awsRdsHelper';

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
        res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
    });
}

// Check if the MySQL Db is "Available" every 24 hours. If so, stop the instance.
const rule = new schedule.RecurrenceRule();
rule.hour = 9;
rule.minute = 0;
rule.tz = 'America/New_York';
schedule.scheduleJob(rule, function(){
    checkRdsStatus(RDS_TYPE.PROD).then((status) => {
        console.log(`Current AWS RDS Production status: '${status}'`);
        if (status === AWS_RDS_STATUS.AVAILABLE) {
            stopRdsInstance(RDS_TYPE.PROD).then(() => {
                console.log(`Stopping AWS RDS Production instance`);
            }).catch((err) => {
                console.error(err, err.stack);
            });
        }
    });

    checkRdsStatus(RDS_TYPE.TEST).then((status) => {
        console.log(`Current AWS RDS Test status: '${status}'`);
        if (status === AWS_RDS_STATUS.AVAILABLE) {
            stopRdsInstance(RDS_TYPE.TEST).then(() => {
                console.log(`Stopping AWS RDS Test instance`);
            }).catch((err) => {
                console.error(err, err.stack);
            });
        }
    });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Stats server started on port ${port}`));
<<<<<<< HEAD
console.log((process.env.TEST_DB === 'false' || process.env.NODE_ENV === 'production') ? 
    "Connected to DB Production endpoints!" : 
    "Connected to DB Test endpoints."
);
=======
console.log(`Test DB: ${!!process.env.TEST_DB}`);
>>>>>>> fixed dpmDiff values. added matchSubmit API test endpoint

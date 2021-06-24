// Preload environmental variables in ES6
import _ from '../env';
// Import for deployment
import "core-js/stable";
import "regenerator-runtime/runtime";
// Import Routes
import { 
  AWS_RDS_STATUS,
  DYNAMODB_TABLENAMES,
  RDS_TYPE
} from './services/constants';
import {
  checkRdsStatus,
  stopRdsInstance
} from './functions/apiV1/dependencies/awsRdsHelper';
import { dynamoDbCreateBackup } from './functions/apiV1/dependencies/dynamoDbHelper';
import authV1Routes from './routes/apiV1/authRoutes.js';
import leagueV1Routes from './routes/apiV1/leagueRoutes.js';
import seasonV1Routes from './routes/apiV1/seasonRoutes.js';
import tournamentV1Routes from './routes/apiV1/tournamentRoutes.js';
import profileV1Routes from './routes/apiV1/profileRoutes.js';
import teamV1Routes from './routes/apiV1/teamRoutes.js';
import matchV1Routes from './routes/apiV1/matchRoutes.js';
import staffV1Routes from './routes/apiV1/staffRoutes.js';
import serviceV1Routes from './routes/apiV1/serviceRoutes';

/*  Declaring npm modules */
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;
const schedule = require('node-schedule');
const cookieParser = require('cookie-parser');

// Configure express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
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
app.use('/api/service/v1', serviceV1Routes);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
  });
}

// Check if the MySQL Db is "Available". If so, stop the instance.
const checkRdsStatusFunction = () => {
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
}
// Create DynamoDb backups once per week
const createDynamoDbBackups = () => {
  Object.values(DYNAMODB_TABLENAMES).forEach((tableName) => {
    dynamoDbCreateBackup(tableName).then(() => { }).catch((err) => {
      console.error(err, err.stack);
    });
  });
}
// Check Rds availability daily at 3amEST, 10amEST, 9pmEST
const TZ_STRING = 'America/New_York';
const rule1 = new schedule.RecurrenceRule();
rule1.hour = 3;
rule1.minute = 0;
rule1.tz = TZ_STRING;
const rule2 = new schedule.RecurrenceRule();
rule2.hour = 10;
rule2.minute = 0;
rule2.tz = TZ_STRING;
const rule3 = new schedule.RecurrenceRule();
rule3.hour = 21;
rule3.minute = 0;
rule3.tz = TZ_STRING;
schedule.scheduleJob(rule1, checkRdsStatusFunction);
schedule.scheduleJob(rule2, checkRdsStatusFunction);
schedule.scheduleJob(rule3, checkRdsStatusFunction);
// Create DynamoDb Backups: Once every week on Sunday
const rule4 = new schedule.RecurrenceRule();
rule4.dayOfWeek = 0;
rule4.hour = 0;
rule4.minute = 1;
schedule.scheduleJob(rule4, createDynamoDbBackups);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Stats server started on port ${port}`));
console.log((process.env.TEST_DB === 'false' || process.env.NODE_ENV === 'production') ?
  "Connected to DB Production endpoints!" :
  "Connected to DB Test endpoints."
);

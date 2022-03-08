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
import { 
  dynamoDbCreateBackup,
  dynamoDbCreateTestTable
} from './functions/apiV1/dependencies/dynamoDbHelper';
import authV1Routes from './routes/apiV1/authRoutes.js';
import leagueV1Routes from './routes/apiV1/leagueRoutes.js';
import seasonV1Routes from './routes/apiV1/seasonRoutes.js';
import tournamentV1Routes from './routes/apiV1/tournamentRoutes.js';
import profileV1Routes from './routes/apiV1/profileRoutes.js';
import teamV1Routes from './routes/apiV1/teamRoutes.js';
import matchV1Routes from './routes/apiV1/matchRoutes.js';
import staffV1Routes from './routes/apiV1/staffRoutes.js';
import serviceV1Routes from './routes/apiV1/serviceRoutes';
import {
  updateChampByIds,
  updateVersionList
} from './services/miscDynamoDb';

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

// Task 1: Check if the MySQL Db is "Available". If so, stop the instance.
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
// Check Rds availability daily at 3amEST, 10amEST, 9pmEST
const TZ_STRING = 'America/New_York';
const rule_checkRdsStatus1 = new schedule.RecurrenceRule();
rule_checkRdsStatus1.hour = 3;
rule_checkRdsStatus1.minute = 0;
rule_checkRdsStatus1.tz = TZ_STRING;
const rule_checkRdsStatus2 = new schedule.RecurrenceRule();
rule_checkRdsStatus2.hour = 9;
rule_checkRdsStatus2.minute = 0;
rule_checkRdsStatus2.tz = TZ_STRING;
const rule_checkRdsStatus3 = new schedule.RecurrenceRule();
rule_checkRdsStatus3.hour = 21;
rule_checkRdsStatus3.minute = 0;
rule_checkRdsStatus3.tz = TZ_STRING;
schedule.scheduleJob(rule_checkRdsStatus1, checkRdsStatusFunction);
schedule.scheduleJob(rule_checkRdsStatus2, checkRdsStatusFunction);
schedule.scheduleJob(rule_checkRdsStatus3, checkRdsStatusFunction);

// Task 2: Create DynamoDb backups once per week on Saturday
const createDynamoDbBackups = () => {
  Object.values(DYNAMODB_TABLENAMES).forEach((tableName) => {
    dynamoDbCreateBackup(tableName).then(() => { }).catch((err) => {
      console.error(err, err.stack);
    });
  });
}
const rule_createDynamoDbBackups = new schedule.RecurrenceRule();
rule_createDynamoDbBackups.dayOfWeek = 6;
rule_createDynamoDbBackups.hour = 6;
rule_createDynamoDbBackups.minute = 1;
rule_createDynamoDbBackups.tz = TZ_STRING;
schedule.scheduleJob(rule_createDynamoDbBackups, createDynamoDbBackups);

// Task 3: Create DynamoDb Test Tables from the backups once every month (on the 1st)
const createDynamoDbTestTables = async () => {
  // Call each table synchronously since DynamoDb's restoreTableFromBackup can only handle 4 fxns at once
  console.log("Restoring backups as Test Tables.");
  for (const tableName of Object.values(DYNAMODB_TABLENAMES)) {
    await dynamoDbCreateTestTable(tableName);
  }
  console.log("Test Table restoration completed.");
}
const rule_createDynamoDbTests = new schedule.RecurrenceRule();
rule_createDynamoDbTests.date = 1;
rule_createDynamoDbTests.hour = 0;
rule_createDynamoDbTests.minute = 1;
rule_createDynamoDbTests.second = 0;
rule_createDynamoDbTests.tz = TZ_STRING;
schedule.scheduleJob(rule_createDynamoDbTests, createDynamoDbTestTables);

// Task 4: Update VersionList and ChampByIds from Ddragon once a week 
// (on Thursday @6pmEST since patch day is Wednesday)
const rule_updateVersion = new schedule.RecurrenceRule();
rule_updateVersion.dayofWeek = 4;
rule_updateVersion.hour = 18;
rule_updateVersion.minute = 0;
rule_updateVersion.tz = TZ_STRING;
const rule_updateChamps = new schedule.RecurrenceRule();
rule_updateChamps.dayofWeek = 4;
rule_updateChamps.hour = 18;
rule_updateChamps.minute = 1;
rule_updateChamps.tz = TZ_STRING;
schedule.scheduleJob(rule_updateVersion, updateVersionList);
schedule.scheduleJob(rule_updateChamps, updateChampByIds);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Stats server started on port ${port}`));
console.log((process.env.TEST_DB === 'false' || process.env.NODE_ENV === 'production') ?
  "Connected to DB Production endpoints!" :
  "Connected to DB Test endpoints."
);

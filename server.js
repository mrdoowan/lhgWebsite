/*  Declaring npm modules */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;
require('dotenv').config();

// Import Routes
const authV1Routes = require('./routes/apiV1/auth');
const leagueV1Routes = require('./routes/apiV1/league');
const seasonV1Routes = require('./routes/apiV1/season');
const tournamentV1Routes = require('./routes/apiV1/tournament');
const profileV1Routes = require('./routes/apiV1/profile');
const teamV1Routes = require('./routes/apiV1/team');
const matchV1Routes = require('./routes/apiV1/match');
const staffV1Routes = require('./routes/apiV1/staff');

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

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Stats server started on port ${port}`));
import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';

// Components
import NavBar from "./components/NavBar";
// Pages
import home from "./pages/Home";
import login from "./pages/Login";
import about from "./pages/About";
import { leagues } from "./pages/League";
import schedule from "./pages/Schedule";
import { error404 } from "./pages/Error";
import { seasonBase, seasonRoster, seasonRegular, seasonPlayoffs } from './pages/Season';
import { tournamentBase, tournamentPlayers, tournamentTeams, tournamentPickBans, tournamentGames } from './pages/Tournament';
import { teamBase, teamGames, teamStats } from './pages/Team';
import { profileBase, profileGames, profileStats } from './pages/Profile';
import { matchBase, matchStats, matchTimeline, matchBuilds } from './pages/Match';
// MUI
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

const theme = createMuiTheme({
    palette: {
        type: 'light',
        primary: {
            main: '#fbc02d',
        },
        secondary: {
            main: '#3f51b5',
        },
        contrastThreshold: 3,
    },
});

class App extends Component {
    render() {
        return (
            <ThemeProvider theme={theme}>
            <BrowserRouter>
            <NavBar />
                <div className="container-wrap">
                    <Switch>
                        { /* Home Page and Basic Nav */ }
                        <Route path="/" component={home} exact/>
                        <Route path="/about" component={about} exact/>
                        <Route path="/leagues" component={leagues} exact/>
                        <Route path="/schedule" component={schedule} exact/>
                        <Route path="/login" component={login} exact/>

                        { /* Season Links */ }
                        <Route path="/season/:seasonShortName" component={seasonBase} exact/>
                        <Route path="/season/:seasonShortName/roster" component={seasonRoster} exact/>
                        <Route path="/season/:seasonShortName/regular" component={seasonRegular} exact/>
                        <Route path="/season/:seasonShortName/playoffs" component={seasonPlayoffs} exact/>

                        { /* Tournament Links */ }
                        <Route path="/tournament/:tournamentShortName" component={tournamentBase} exact/>
                        <Route path="/tournament/:tournamentShortName/players" component={tournamentPlayers} exact/>
                        <Route path="/tournament/:tournamentShortName/teams" component={tournamentTeams} exact/>
                        <Route path="/tournament/:tournamentShortName/pickbans" component={tournamentPickBans} exact/>
                        <Route path="/tournament/:tournamentShortName/games" component={tournamentGames} exact/>

                        { /* Team Links */ }
                        <Route path="/team/:teamName" component={teamBase} exact/>
                        <Route path="/team/:teamName/games" component={teamGames} exact/>
                        <Route path="/team/:teamName/games/:seasonShortName" component={teamGames} exact/>
                        <Route path="/team/:teamName/stats" component={teamStats} exact/>
                        <Route path="/team/:teamName/stats/:tournamentShortName" component={teamStats} exact/>

                        { /* Profile Links */ }
                        <Route path="/profile/:profileName" component={profileBase} exact/>
                        <Route path="/profile/:profileName/games" component={profileGames} exact/>
                        <Route path="/profile/:profileName/games/:seasonShortName" component={profileGames} exact/>
                        <Route path="/profile/:profileName/stats" component={profileStats} exact/>
                        <Route path="/profile/:profileName/stats/:tournamentShortName" component={profileStats} exact/>

                        { /* Match Links */ }
                        <Route path="/match/:matchPId" component={matchBase} exact/>
                        <Route path="/match/:matchPId/stats" component={matchStats} exact/>
                        <Route path="/match/:matchPId/timeline" component={matchTimeline} exact/>
                        <Route path="/match/:matchPId/builds" component={matchBuilds} exact/>

                        { /* ERROR 404: Path does not exist */ }
                        <Route component={error404} />
                    </Switch>
                    <div className="footer">"LHG Competitive Leagues is not affiliated with or sponsored by Riot Games, Inc. or LoLEsports."</div>
                </div>
            </BrowserRouter>
            </ThemeProvider>
        );
    }
}

export default App;
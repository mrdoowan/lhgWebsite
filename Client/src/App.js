import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';
// Components
import NavBar from "./components/NavBar";
// Pages
import home from "./pages/home";
import login from "./pages/login";
import about from "./pages/about";
import { leagues } from "./pages/league";
import schedule from "./pages/schedule";
import error from "./pages/error";
import { seasonBase, seasonRoster, seasonRegular, seasonPlayoffs } from './pages/season';
import { tournamentBase, tournamentPlayers, tournamentTeams, tournamentPickBans, tournamentGames } from './pages/tournament';
import { teamBase, teamGames, teamStats } from './pages/team';
import { profileBase, profileGames, profileStats } from './pages/profile';
import { matchBase } from './pages/match';
// MUI
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

const theme = createMuiTheme({
    palette: {
        type: 'light',
    },
});

class App extends Component {
    render() {
        return (
            <ThemeProvider theme={theme}><BrowserRouter>
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
                        <Route path="/team/:teamName/games/:seasonShortName" component={teamGames} exact/>
                        <Route path="/team/:teamName/stats/:tournamentShortName" component={teamStats} exact/>

                        { /* Profile Links */ }
                        <Route path="/profile/:profileName" component={profileBase} exact/>
                        <Route path="/profile/:profileName/games/:seasonShortName" component={profileGames} exact/>
                        <Route path="/profile/:profileName/stats/:tournamentShortName" component={profileStats} exact/>

                        { /* Match Links */ }
                        <Route path="/match/:matchPId" component={matchBase} exact/>

                        { /* ERROR 404: Path does not exist */ }
                        <Route component={error} />
                    </Switch>
                    <div className="footer">"LHG Competitive Leagues is not affiliated with or sponsored by Riot Games, Inc. or LoLEsports."</div>
                </div>
            </BrowserRouter></ThemeProvider>
        );
    }
}

export default App;
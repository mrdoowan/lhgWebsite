import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
// Components
import NavBar from "./components/NavBar";
// Pages
import home from "./pages/home";
import login from "./pages/login";
import about from "./pages/about";
import { leagues } from "./pages/league";
import schedule from "./pages/schedule";
import Error from "./pages/error";
import { seasonBase, seasonRoster, seasonRegular, seasonPlayoffs } from './pages/season';
import { tournamentBase, tournamentPlayers, tournamentTeams, tournamentPickBans } from './pages/tournament';
import { teamBase, teamPlayers, teamScouting, teamGames, teamStats } from './pages/team';
import { profileBase, profileChamps, profileGames, profileStats } from './pages/profile';
import { matchBase } from './pages/match';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#2196f3',
        },
        secondary: {
            main: '#009688',
        },
        contrastThreshold: 3,
    },
})

class App extends Component {
    render() {
        return (
            <MuiThemeProvider theme={theme}>
                <BrowserRouter>
                <NavBar />
                    <div className="container">
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

                        { /* Team Links */ }
                        <Route path="/team/:teamName" component={teamBase} exact/>
                        <Route path="/team/:teamName/players" component={teamPlayers} exact/>
                        <Route path="/team/:teamName/scouting/:seasonShortName" component={teamScouting} exact/>
                        <Route path="/team/:teamName/games/:seasonShortName" component={teamGames} exact/>
                        <Route path="/team/:teamName/stats/:tournamentShortName" component={teamStats} exact/>

                        { /* Profile Links */ }
                        <Route path="/profile/:profileName" component={profileBase} exact/>
                        <Route path="/profile/:profileName/champs" component={profileChamps} exact/>
                        <Route path="/profile/:profileName/games/:seasonShortName" component={profileGames} exact/>
                        <Route path="/profile/:profileName/stats/:tournamentShortName" component={profileStats} exact/>

                        { /* Match Links */ }
                        <Route path="/match/:matchPId" component={matchBase} exact/>

                        { /* ERROR 404: Path does not exist */ }
                        <Route component={Error} />
                    </Switch>
                    </div>
                </BrowserRouter>
            </MuiThemeProvider>
            
        );
    }
}

export default App;

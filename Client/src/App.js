import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
// Components
import NavBar from "./components/NavBar";
// Pages
import Home from "./pages/home";
import Login from "./pages/login";
import About from "./pages/about";
import { Leagues } from "./pages/league";
import Schedule from "./pages/schedule";
import Error from "./pages/error";
import { seasonBase, seasonRoster, seasonRegular, seasonPlayoffs } from './pages/season';
import { tournamentBase, tournamentPlayers, tournamentTeams, tournamentPickBans } from './pages/tournament';
import { teamBase, teamPlayers, teamScouting, teamGames, teamStats } from './pages/team';
import { ProfileBase, ProfileChamps, ProfileGames, ProfileStats } from './pages/profile';
import { ChampionBase, ChampionName } from './pages/champ';
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
                            <Route path="/" component={Home} exact/>
                            <Route path="/about" component={About} exact/>
                            <Route path="/leagues" component={Leagues} exact/>
                            <Route path="/schedule" component={Schedule} exact/>
                            <Route path="/login" component={Login} exact/>

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
                            <Route path="/profile/:profileName" component={ProfileBase} exact/>
                            <Route path="/profile/:profileName/champs" component={ProfileChamps} exact/>
                            <Route path="/profile/:profileName/games/:seasonShortName" component={ProfileGames} exact/>
                            <Route path="/profile/:profileName/stats/:tournamentShortName" component={ProfileStats} exact/>

                            { /* Match Links */ }
                            <Route path="/match/:matchPId" component={matchBase} exact/>

                            { /* League Champions Links */ }
                            <Route path="/champion/" component={ChampionBase} exact/>
                            <Route path="/champion/:champName" component={ChampionName} exact/>

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

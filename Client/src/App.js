import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';

import Home from "./components/Home";
import Login from "./components/Login";
import About from "./components/About";
import { Leagues } from "./components/Leagues";
import Schedule from "./components/Schedule";
import Error from "./components/Error";
import NavBar from "./components/NavBar";
import { SeasonBase, SeasonRoster, SeasonRegular, SeasonPlayoffs } from './components/Season';
import { TournamentBase, TournamentPlayers, TournamentTeams, TournamentPickBans } from './components/Tournament';
import { TeamBase, TeamPlayers, TeamScouting, TeamGames, TeamStats } from './components/Team';
import { ProfileBase, ProfileChamps, ProfileGames, ProfileStats } from './components/Profile';
import { ChampionBase, ChampionName } from './components/Champ';
import { MatchBase } from './components/Match';

class App extends Component {

    render() {
        return (
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
                        <Route path="/season/:seasonShortName" component={SeasonBase} exact/>
                        <Route path="/season/:seasonShortName/roster" component={SeasonRoster} exact/>
                        <Route path="/season/:seasonShortName/regular" component={SeasonRegular} exact/>
                        <Route path="/season/:seasonShortName/playoffs" component={SeasonPlayoffs} exact/>

                        { /* Tournament Links */ }
                        <Route path="/tournament/:tournamentShortName" component={TournamentBase} exact/>
                        <Route path="/tournament/:tournamentShortName/players" component={TournamentPlayers} exact/>
                        <Route path="/tournament/:tournamentShortName/teams" component={TournamentTeams} exact/>
                        <Route path="/tournament/:tournamentShortName/pickbans" component={TournamentPickBans} exact/>

                        { /* Team Links */ }
                        <Route path="/team/:teamName" component={TeamBase} exact/>
                        <Route path="/team/:teamName/players" component={TeamPlayers} exact/>
                        <Route path="/team/:teamName/scouting/:seasonShortName" component={TeamScouting} exact/>
                        <Route path="/team/:teamName/games/:seasonShortName" component={TeamGames} exact/>
                        <Route path="/team/:teamName/stats/:tournamentShortName" component={TeamStats} exact/>

                        { /* Profile Links */ }
                        <Route path="/profile/:profileName" component={ProfileBase} exact/>
                        <Route path="/profile/:profileName/champs" component={ProfileChamps} exact/>
                        <Route path="/profile/:profileName/games/:seasonShortName" component={ProfileGames} exact/>
                        <Route path="/profile/:profileName/stats/:tournamentShortName" component={ProfileStats} exact/>

                        { /* Match Links */ }
                        <Route path="/match/:matchPId" component={MatchBase} exact/>

                        { /* League Champions Links */ }
                        <Route path="/champion/" component={ChampionBase} exact/>
                        <Route path="/champion/:champName" component={ChampionName} exact/>

                        { /* ERROR 404: Path does not exist */ }
                        <Route component={Error} />
                    </Switch>
                </div>
            </BrowserRouter>
        );
    }
}

export default App;

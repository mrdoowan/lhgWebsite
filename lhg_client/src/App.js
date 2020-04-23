import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';

import Customers from './components/customers/customers';
import Home from "./components/Home";
import Login from "./components/Login";
import About from "./components/About";
import Leagues from "./components/Leagues";
import Schedule from "./components/Schedule";
import Error from "./components/Error";
import Navigation from './components/Navigation';
import { SeasonBase, SeasonRoster, SeasonRegular, SeasonPlayoffs } from './components/Season';
import { TournamentBase, TournamentPickBans } from './components/Tournament';
import { TeamBase, TeamPlayers, TeamGames, TeamStats } from './components/Team';
import { ProfileBase, ProfileGames, ProfileStats } from './components/Profile';
import { ChampionBase, ChampionName } from './components/Champ';
import { MatchBase } from './components/Match';

class App extends Component {

    /*
        Below was the example from the video that took the GET API request from customer.js
    */
    /*
    render() {
        return (
            <div className="App">
                <Customers />
            </div>
        );
    }
    */

    render() {
        return (
            <BrowserRouter>
                <Navigation />
                <Switch>
                    { /* Home Page and Basic Nav */ }
                    <Route path="/" component={Home} exact/>
                    <Route path="/login" component={Login} exact/>
                    <Route path="/about" component={About} exact/>
                    <Route path="/leagues" component={Leagues} exact/>
                    <Route path="/schedule" component={Schedule} exact/>

                    { /* Season Links */ }
                    <Route path="/season/:seasonShortName" component={SeasonBase} exact/>
                    <Route path="/season/:seasonShortName/roster" component={SeasonRoster} exact/>
                    <Route path="/season/:seasonShortName/regular" component={SeasonRegular} exact/>
                    <Route path="/season/:seasonShortName/playoffs" component={SeasonPlayoffs} exact/>

                    { /* Tournament Links */ }
                    <Route path="/tournament/:tournamentShortName" component={TournamentBase} exact/>
                    <Route path="/tournament/:tournamentShortName/pickbans" component={TournamentPickBans} exact/>

                    { /* Team Links */ }
                    <Route path="/team/:teamName" component={TeamBase} exact/>
                    <Route path="/team/:teamName/players" component={TeamPlayers} exact/>
                    <Route path="/team/:teamName/games/:seasonShortName" component={TeamGames} exact/>
                    <Route path="/team/:teamName/stats/:tournamentShortName" component={TeamStats} exact/>

                    { /* Profile Links */ }
                    <Route path="/profile/:profileName" component={ProfileBase} exact/>
                    <Route path="/profile/:profileName/games/:seasonShortName" component={ProfileGames} exact/>
                    <Route path="/profile/:profileName/stats/:tournamentShortName" component={ProfileStats} exact/>

                    { /* Match Links */ }
                    <Route path="/match/:matchPID" component={MatchBase} exact/>

                    { /* League Champions Links */ }
                    <Route path="/champion/" component={ChampionBase} exact/>
                    <Route path="/champion/:champName" component={ChampionName} exact/>

                    { /* ERROR 404: Path does not exist */ }
                    <Route component={Error} />
                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;

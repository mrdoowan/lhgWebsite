import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';

import Customers from './components/customers/customers';
import Home from "./components/Home";
import About from "./components/About";
import Leagues from "./components/Leagues";
import Schedule from "./components/Schedule";
import Error from "./components/Error";
import Navigation from './components/Navigation';
import { TournamentBase, TournamentRoster, TournamentScouting, TournamentRegular, TournamentPost, TournamentStats, TournamentPickBans } from './components/Tournament';
import { TeamBase, TeamPlayers, TeamTournaments, TeamGames, TeamStats } from './components/Team';
import { PlayerBase, PlayerTournaments, PlayerGames, PlayerStats } from './components/Player';
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
                    <Route path="/" component={Home} exact />
                    <Route path="/about" component={About} exact/>
                    <Route path="/leagues" component={Leagues} exact/>
                    <Route path="/schedule" component={Schedule} exact/>

                    { /* Tournament Links */ }
                    <Route path="/tournament/:tourneyShortName" component={TournamentBase} exact/>
                    <Route path="/tournament/:tourneyShortName/rosters" component={TournamentRoster} exact/>
                    <Route path="/tournament/:tourneyShortName/scouting/:teamName" component={TournamentScouting} exact/>
                    <Route path="/tournament/:tourneyShortName/regular" component={TournamentRegular} exact/>
                    <Route path="/tournament/:tourneyShortName/playoffs" component={TournamentPost} exact/>
                    <Route path="/tournament/:tourneyShortName/stats" component={TournamentStats} exact/>
                    <Route path="/tournament/:tourneyShortName/pickbans" component={TournamentPickBans} exact/>

                    { /* Team Links */ }
                    <Route path="/team/:teamName" component={TeamBase} exact/>
                    <Route path="/team/:teamName/players" component={TeamPlayers} exact/>
                    <Route path="/team/:teamName/tournaments" component={TeamTournaments} exact/>
                    <Route path="/team/:teamName/games" component={TeamGames} exact/>
                    <Route path="/team/:teamName/stats" component={TeamStats} exact/>

                    { /* Player Links */ }
                    <Route path="/player/:playerName" component={PlayerBase} exact/>
                    <Route path="/player/:playerName/tournaments" component={PlayerTournaments} exact/>
                    <Route path="/player/:playerName/games" component={PlayerGames} exact/>
                    <Route path="/player/:playerName/stats" component={PlayerStats} exact/>

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

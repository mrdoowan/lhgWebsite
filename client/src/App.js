import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import './App.css';
// MUI
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
// Components
import NavBar from './components/NavBar';
// Pages
import HomePage from './pages/Home';
import login from './pages/Login';
import error404 from './pages/Error';
import {
  seasonBase,
  seasonRoster,
  seasonRegular,
  seasonPlayoffs,
} from './pages/Season';
import {
  tournamentBase,
  tournamentPlayers,
  tournamentTeams,
  tournamentPickBans,
  tournamentGames,
  TournamentUpdatePage,
} from './pages/Tournament';
import {
  teamBase,
  teamGames,
  teamStats,
} from './pages/Team';
import {
  profileBase,
  profileGames,
  profileStats,
} from './pages/Profile';
import {
  matchBase,
  matchStats,
  matchTimeline,
  matchBuilds,
  MatchSetupPage,
  MatchSetupListPage,
} from './pages/Match';

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
    return (<ThemeProvider theme={theme}>
      <NavBar />
      <div className="container-wrap">
        <Switch>
          { /* Home Page and Basic Nav */}
          <Route path="/" component={HomePage} exact />
          <Route path="/login" component={login} exact />

          { /* Season Links */}
          <Route path="/season/:seasonShortName" component={seasonBase} exact />
          <Route path="/season/:seasonShortName/roster" component={seasonRoster} exact />
          <Route path="/season/:seasonShortName/regular" component={seasonRegular} exact />
          <Route path="/season/:seasonShortName/playoffs" component={seasonPlayoffs} exact />

          { /* Tournament Links */}
          <Route path="/tournament/:tournamentShortName" component={tournamentBase} exact />
          <Route path="/tournament/:tournamentShortName/players" component={tournamentPlayers} exact />
          <Route path="/tournament/:tournamentShortName/teams" component={tournamentTeams} exact />
          <Route path="/tournament/:tournamentShortName/pickbans" component={tournamentPickBans} exact />
          <Route path="/tournament/:tournamentShortName/games" component={tournamentGames} exact />
          <Route path="/tournament/:tournamentShortName/update" component={TournamentUpdatePage} exact />

          { /* Team Links */}
          <Route path="/team/:teamName" component={teamBase} exact />
          <Route path="/team/:teamName/games" component={teamGames} exact />
          <Route path="/team/:teamName/games/:seasonShortName" component={teamGames} exact />
          <Route path="/team/:teamName/stats" component={teamStats} exact />
          <Route path="/team/:teamName/stats/:tournamentShortName" component={teamStats} exact />

          { /* Profile Links */}
          <Route path="/profile/:profileName" component={profileBase} exact />
          <Route path="/profile/:profileName/games" component={profileGames} exact />
          <Route path="/profile/:profileName/games/:seasonShortName" component={profileGames} exact />
          <Route path="/profile/:profileName/stats" component={profileStats} exact />
          <Route path="/profile/:profileName/stats/:tournamentShortName" component={profileStats} exact />
          {/* <Route path="/player/namechange" component={profileBase} exact/> */}

          { /* Match Links */}
          <Route path="/match/:matchPId" component={matchBase} exact />
          <Route path="/match/:matchPId/stats" component={matchStats} exact />
          <Route path="/match/:matchPId/timeline" component={matchTimeline} exact />
          <Route path="/match/:matchPId/builds" component={matchBuilds} exact />
          <Route path="/match/:matchPId/setup" component={MatchSetupPage} exact />
          <Route path="/matchsetup/list" component={MatchSetupListPage} exact />

          { /* ERROR 404: Path does not exist */}
          <Route component={error404} />
        </Switch>
        <div className="footer">
          "Doowan Stats isn't endorsed by Riot Games and doesn't reflect the views or opinions 
          of Riot Games or anyone officially involved in producing or managing Riot Games properties. 
          Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc."
        </div>
      </div>
    </ThemeProvider>);
  }
}

export default App;

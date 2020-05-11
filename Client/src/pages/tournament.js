import React, { Component } from 'react';
import { Link } from 'react-router-dom';
// Components
import TourneyTab from '../components/TourneyTab';

// If shortname is not in the database, redirect to 404 - FUNCTION HERE

// Instead of reading from DynamoDb, read locally for testing
const testLeaderboardObject = require('../test/leaderboardTest');
const testLeaderboard = true;

// {MAIN}/tournament/:tournamentShortName
export class tournamentBase extends Component {
    state = {
        info: null,
        stats: null,
        leaderboards: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;

        fetch('/api/tournament/information/name/' + params.tournamentShortName)
        .then(res => res.json())
        .then(data => {
            this.setState({
                info: data
            });
        })
        .catch(err => console.error(err));

        fetch('/api/tournament/stats/name/' + params.tournamentShortName)
        .then(res => res.json())
        .then(data => {
            this.setState({
                stats: data
            });
        })
        .catch(err => console.error(err));

        if (testLeaderboard) {
            this.setState({
                leaderboards: testLeaderboardObject
            })
        }
        else {
            fetch('/api/tournament/leaderboards/name/'  + params.tournamentShortName)
            .then(res => res.json())
            .then(data => {
                this.setState({
                    leaderboards: data
                })
            })
            .catch(err => console.error(err));
        }
    }

    tourneyTypeString(str) {
        return (str === 'Regular') ? 
            "Regular Season" :
            "Playoffs";
    }

    render() {
        console.log(this.state);
        const { info } = this.state;

        let titleMarkUp = info ? (
            <div className="body">
                <p><Link to={`/season/${info.SeasonShortName}`}>{info.SeasonName}</Link> {this.tourneyTypeString(info.TournamentType)}</p>
                <p>Tournament Stats</p>
            </div>
        ) : (<div></div>);

        let tourneyBar = info ? (
            <TourneyTab shortName={info.TournamentShortName}/>
        ) : (<div></div>);

        return (
            <div>
                {titleMarkUp}
                {tourneyBar}
            </div>
        )
    }
}

// {MAIN}/tournament/:tournamentShortName/players
export const tournamentPlayers = (props) => {
    const shortName = props.match.params.tournamentShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament Players Data Table: {shortName}</p>
        </div>
    );
};

// {MAIN}/tournament/:tournamentShortName/teams
export const tournamentTeams = (props) => {
    const shortName = props.match.params.tournamentShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament Team Data Table: {shortName}</p>
        </div>
    );
};

// {MAIN}/tournament/:tournamentShortName/pickbans
export const tournamentPickBans = (props) => {
    const shortName = props.match.params.tournamentShortName;

    return (
        <div className="body">
            <p>LHG Shortname Tournament: {shortName} [Pick Bans]</p>
        </div>
    );
};
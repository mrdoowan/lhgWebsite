import React, { Component } from 'react';
// Util
import TourneyBaseSkeleton from '../util/Tournament/TourneyBaseSkeleton';
import TourneyTeamsSkeleton from '../util/Tournament/TourneyTeamsSkeleton';
import TourneyPlayersSkeleton from '../util/Tournament/TourneyPlayersSkeleton';
import TourneyChampsSkeleton from '../util/Tournament/TourneyChampsSkeleton';
// Note: Nothing MUI can be done here because of how React Hooks work.

// If shortname is not in the database, redirect to 404 - FUNCTION HERE

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

        fetch('/api/tournament/leaderboards/name/'  + params.tournamentShortName)
        .then(res => res.json())
        .then(data => {
            this.setState({
                leaderboards: data
            })
        })
        .catch(err => console.error(err));
    }

    render() {
        console.log(this.state);
        const { info, stats, leaderboards } = this.state;

        return (
            <div>
                <TourneyBaseSkeleton info={info} stats={stats} lb={leaderboards} />
            </div>
        )
    }
}

// {MAIN}/tournament/:tournamentShortName/players
export class tournamentPlayers extends Component {
    state = {
        info: null,
        players: null,
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

        fetch('/api/tournament/players/name/' + params.tournamentShortName)
        .then(res => res.json())
        .then(data => {
            this.setState({
                players: data
            });
        })
        .catch(err => console.error(err));
    }

    render() {
        console.log(this.state);
        const { info, players } = this.state;

        return (
            <div>
                <TourneyPlayersSkeleton info={info} players={players} />
            </div>
        )
    }
}

// {MAIN}/tournament/:tournamentShortName/teams
export class tournamentTeams extends Component {
    state = {
        info: null,
        teams: null,
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

        fetch('/api/tournament/teams/name/' + params.tournamentShortName)
        .then(res => res.json())
        .then(data => {
            this.setState({
                teams: data
            });
        })
        .catch(err => console.error(err));
    }

    render() {
        console.log(this.state);
        const { info, teams } = this.state;

        return (
            <div>
                <TourneyTeamsSkeleton info={info} teams={teams} />
            </div>
        )
    }
}

// {MAIN}/tournament/:tournamentShortName/pickbans
export class tournamentPickBans extends Component {
    state = {
        info: null,
        pickBans: null,
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

        fetch('/api/tournament/pickbans/name/' + params.tournamentShortName)
        .then(res => res.json())
        .then(data => {
            this.setState({
                pickBans: data
            });
        })
        .catch(err => console.error(err));
    }

    render() {
        console.log(this.state);
        const { info, pickBans } = this.state;

        return (
            <div>
                <TourneyChampsSkeleton info={info} pb={pickBans} type="Champs" />
            </div>
        )
    }
}
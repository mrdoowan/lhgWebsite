import React, { Component } from 'react';
//import { Link } from 'react-router-dom';
// Components
import TourneyHeader from '../components/TourneyHeader';
import TourneyStats from '../components/TourneyStats';

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

        let headerMarkup = info ? (
            <div><TourneyHeader info={info} type='Tournament' /></div>
        ) : (<div></div>);

        let statsMarkup = stats ? (
            <div><TourneyStats /></div>
        ) : (<div>Loading...</div>)

        return (
            <div>
                {headerMarkup}
                {statsMarkup}
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
        const { info } = this.state;

        return (
            <div>
                <TourneyHeader info={info} type="Players" />
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
        const { info } = this.state;

        return (
            <div>
                <TourneyHeader info={info} type="Teams" />
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
        const { info } = this.state;

        return (
            <div>
                <TourneyHeader info={info} type="Champs" />
            </div>
        )
    }
}

// {MAIN}/tournament/:tournamentShortName/games
export class tournamentGames extends Component {
    state = {
        info: null,
        games: null,
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

        fetch('/api/tournament/games/name/' + params.tournamentShortName)
        .then(res => res.json())
        .then(data => {
            this.setState({
                games: data
            });
        })
        .catch(err => console.error(err));
    }

    render() {
        console.log(this.state);
        const { info } = this.state;

        return (
            <div>
                <TourneyHeader info={info} type="Games" />
            </div>
        )
    }
}
import React, { Component } from 'react';
// Components
import Markup from '../components/Markup';
import Error from '../components/ErrorComponent';
// Util
import TourneyBaseSkeleton from '../util/Tournament/TourneyBaseSkeleton';
import TourneyTeamsSkeleton from '../util/Tournament/TourneyTeamsSkeleton';
import TourneyPlayersSkeleton from '../util/Tournament/TourneyPlayersSkeleton';
import TourneyChampsSkeleton from '../util/Tournament/TourneyChampsSkeleton';
import TourneyGamesSkeleton from '../util/Tournament/TourneyGamesSkeleton';

// {MAIN}/tournament/:tournamentShortName
export class tournamentBase extends Component {
    state = {
        info: null,
        stats: null,
        leaderboards: null,
        statusCode: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;

        fetch('/api/tournament/information/name/' + params.tournamentShortName)
        .then(res => {
            this.setState({
                statusCode: res.status
            });
            res.json().then((data) => {
                this.setState({
                    info: data
                });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));

        fetch('/api/tournament/stats/name/' + params.tournamentShortName)
        .then(res => {
            this.setState({
                statusCode: res.status
            });
            res.json().then((data) => {
                this.setState({
                    stats: data
                });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));

        fetch('/api/tournament/leaderboards/name/'  + params.tournamentShortName)
        .then(res => {
            this.setState({
                statusCode: res.status
            });
            res.json().then((data) => {
                this.setState({
                    leaderboards: data
                });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));
    }

    render() {
        console.log(this.state);
        const { info, stats, leaderboards, statusCode } = this.state;

        let data = {
            stats: stats,
            lb: leaderboards,
        }

        return ((statusCode != null && statusCode !== 200) ? 
            (<Error code={statusCode} page="Tournament" />) :
            (<Markup data={data} component={<TourneyBaseSkeleton info={info} stats={stats} lb={leaderboards} />} code={statusCode} />)
        )
    }
}

// {MAIN}/tournament/:tournamentShortName/players
export class tournamentPlayers extends Component {
    state = {
        info: null,
        players: null,
        statusCode: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;

        fetch('/api/tournament/information/name/' + params.tournamentShortName)
        .then(res => {
            this.setState({
                statusCode: res.status
            });
            res.json().then((data) => {
                this.setState({
                    info: data
                });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));

        fetch('/api/tournament/players/name/' + params.tournamentShortName)
        .then(res => {
            this.setState({
                statusCode: res.status
            });
            res.json().then((data) => {
                this.setState({
                    players: data
                });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));
    }

    render() {
        console.log(this.state);
        const { info, players, statusCode } = this.state;

        return ((statusCode != null && statusCode !== 200) ? 
            (<Error code={statusCode} page="Tournament" />) :
            (<Markup data={players} component={<TourneyPlayersSkeleton info={info} players={players} />} code={statusCode} />)
        )
    }
}

// {MAIN}/tournament/:tournamentShortName/teams
export class tournamentTeams extends Component {
    state = {
        info: null,
        teams: null,
        statusCode: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;

        fetch('/api/tournament/information/name/' + params.tournamentShortName)
        .then(res => {
            this.setState({
                statusCode: res.status
            });
            res.json().then((data) => {
                this.setState({
                    info: data
                });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));

        fetch('/api/tournament/teams/name/' + params.tournamentShortName)
        .then(res => {
            this.setState({
                statusCode: res.status
            });
            res.json().then((data) => {
                this.setState({
                    teams: data
                });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));
    }

    render() {
        console.log(this.state);
        const { info, teams, statusCode } = this.state;

        return ((statusCode != null && statusCode !== 200) ? 
            (<Error code={statusCode} page="Tournament" />) :
            (<Markup data={teams} component={<TourneyTeamsSkeleton info={info} teams={teams} />} code={statusCode} />)
        )
    }
}

// {MAIN}/tournament/:tournamentShortName/pickbans
export class tournamentPickBans extends Component {
    state = {
        info: null,
        pickBans: null,
        statusCode: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;

        fetch('/api/tournament/information/name/' + params.tournamentShortName)
        .then(res => {
            this.setState({
                statusCode: res.status
            });
            res.json().then((data) => {
                this.setState({
                    info: data
                });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));

        fetch('/api/tournament/pickbans/name/' + params.tournamentShortName)
        .then(res => {
            this.setState({
                statusCode: res.status
            });
            res.json().then((data) => {
                this.setState({
                    pickBans: data
                });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));
    }

    render() {
        console.log(this.state);
        const { info, pickBans, statusCode } = this.state;

        return ((statusCode != null && statusCode !== 200) ? 
            (<Error code={statusCode} page="Tournament" />) :
            (<Markup data={pickBans} component={<TourneyChampsSkeleton info={info} pb={pickBans} />} code={statusCode} />)
        )
    }
}

// {MAIN}/tournament/:tournamentShortName/games
export class tournamentGames extends Component {
    state = {
        info: null,
        games: null,
        statusCode: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;

        fetch('/api/tournament/information/name/' + params.tournamentShortName)
        .then(res => {
            this.setState({
                statusCode: res.status
            });
            res.json().then((data) => {
                this.setState({
                    info: data
                });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));

        fetch('/api/tournament/games/name/' + params.tournamentShortName)
        .then(res => {
            this.setState({
                statusCode: res.status
            });
            res.json().then((data) => {
                this.setState({
                    games: data
                });
            });
        })
        .catch(err => console.error(err));
    }

    render() {
        console.log(this.state);
        const { info, games, statusCode } = this.state;

        return ((statusCode != null && statusCode !== 200) ? 
            (<Error code={statusCode} page="Tournament" />) :
            (<Markup data={games} component={<TourneyGamesSkeleton info={info} games={games} />} code={statusCode} />)
        )
    }
}
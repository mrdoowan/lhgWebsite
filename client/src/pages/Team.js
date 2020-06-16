import React, { Component } from 'react';
// Components
import Markup from '../components/Markup';
import Error from '../components/ErrorComponent';
// Util
import TeamBaseSkeleton from '../util/Team/TeamBaseSkeleton';
import TeamGamesSkeleton from '../util/Team/TeamGamesSkeleton';
import TeamStatsSkeleton from '../util/Team/TeamStatsSkeleton';

// {MAIN}/team/:teamName
export class teamBase extends Component {
    state = {
        info: null,
        statusCode: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;

        fetch('/api/team/v1/information/name/' + params.teamName)
        .then(res => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            res.json().then((data) => {
                this.setState({ info: data });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));
    }

    render() {
        const { info, statusCode } = this.state;

        let component = (<TeamBaseSkeleton info={info} />);

        return (
            (statusCode != null && statusCode !== 200) ?
            (<Error code={statusCode} page="Team" />) : 
            (<Markup data={info} dataComponent={component} code={statusCode} />)
        )
    }
}

// {MAIN}/team/:teamName/games
// {MAIN}/team/:teamName/games/:seasonShortName
export class teamGames extends Component {
    state = {
        info: null,
        scouting: null,
        games: null,
        statusCode: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;

        fetch('/api/team/v1/information/name/' + params.teamName)
        .then(res => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            res.json().then((data) => {
                this.setState({ info: data });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));

        if (params.seasonShortName) {
            // Specific season
            fetch('/api/team/v1/scouting/name/' + params.teamName + '/' + params.seasonShortName)
            .then(res => {
                if (this.statusCode === 200 || this.statusCode == null) {
                    this.setState({ statusCode: res.status });
                }
                res.json().then((data) => {
                    this.setState({ scouting: data });
                }).catch(err => console.error(err));
            }).catch(err => console.error(err));

            fetch('/api/team/v1/games/name/' + params.teamName + '/' + params.seasonShortName)
            .then(res => {
                if (this.statusCode === 200 || this.statusCode == null) {
                    this.setState({ statusCode: res.status });
                }
                res.json().then((data) => {
                    this.setState({ games: data });
                }).catch(err => console.error(err));
            }).catch(err => console.error(err));
        }
        else {
            // Latest season
            fetch('/api/team/v1/scouting/latest/name/' + params.teamName)
            .then(res => {
                if (this.statusCode === 200 || this.statusCode == null) {
                    this.setState({ statusCode: res.status });
                }
                res.json().then((data) => {
                    this.setState({ scouting: data });
                }).catch(err => console.error(err));
            }).catch(err => console.error(err));

            fetch('/api/team/v1/games/latest/name/' + params.teamName)
            .then(res => {
                if (this.statusCode === 200 || this.statusCode == null) {
                    this.setState({ statusCode: res.status });
                }
                res.json().then((data) => {
                    this.setState({ games: data });
                }).catch(err => console.error(err));
            }).catch(err => console.error(err));
        }
    }

    render() {
        const { info, scouting, games, statusCode } = this.state;

        let component = (<TeamGamesSkeleton info={info} scouting={scouting} games={games} />);

        return (
            (statusCode != null && statusCode !== 200) ?
            (<Error code={statusCode} page="Team" />) : 
            (<Markup data={info && scouting && games} dataComponent={component} code={statusCode} />)
        )
    }
}

// {MAIN}/team/:teamName/stats
// {MAIN}/team/:teamName/stats/:tournamentShortName
export class teamStats extends Component {
    state = {
        info: null,
        stats: null,
        statusCode: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;

        fetch('/api/team/v1/information/name/' + params.teamName)
        .then(res => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            res.json().then((data) => {
                this.setState({ info: data });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));

        if (params.tournamentShortName) {
            // Specific tournament
            fetch('/api/team/v1/stats/name/' + params.teamName + '/' + params.tournamentShortName)
            .then(res => {
                if (this.statusCode === 200 || this.statusCode == null) {
                    this.setState({ statusCode: res.status });
                }
                res.json().then((data) => {
                    this.setState({ stats: data });
                }).catch(err => console.error(err));
            }).catch(err => console.error(err));
        }
        else {
            // Latest tournament
            fetch('/api/team/v1/stats/latest/name/' + params.teamName)
            .then(res => {
                if (this.statusCode === 200 || this.statusCode == null) {
                    this.setState({ statusCode: res.status });
                }
                res.json().then((data) => {
                    this.setState({ stats: data });
                }).catch(err => console.error(err));
            }).catch(err => console.error(err));
        }
    }

    render() {
        const { info, stats, statusCode } = this.state;

        let component = (<TeamStatsSkeleton info={info} stats={stats} />);

        return (
            (statusCode != null && statusCode !== 200) ?
            (<Error code={statusCode} page="Team" />) : 
            (<Markup data={info && stats} dataComponent={component} code={statusCode} />)
        )
    }
}
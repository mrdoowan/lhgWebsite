import React, { Component } from 'react';
import axios from 'axios';
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

        axios.get(`/api/team/v1/information/name/${params.teamName}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ info: res.data });
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

        axios.get(`/api/team/v1/information/name/${params.teamName}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ info: res.data });
        }).catch(err => console.error(err));

        if (params.seasonShortName) {
            // Specific season
            axios.get(`/api/team/v1/scouting/name/${params.teamName}/${params.seasonShortName}`)
            .then((res) => {
                if (this.statusCode === 200 || this.statusCode == null) {
                    this.setState({ statusCode: res.status });
                }
                this.setState({ scouting: res.data });
            }).catch(err => console.error(err));

            axios.get(`/api/team/v1/games/name/${params.teamName}/${params.seasonShortName}`)
            .then((res) => {
                if (this.statusCode === 200 || this.statusCode == null) {
                    this.setState({ statusCode: res.status });
                }
                this.setState({ games: res.data });
            }).catch(err => console.error(err));
        }
        else {
            // Latest season
            axios.get(`/api/team/v1/scouting/latest/name/${params.teamName}`)
            .then((res) => {
                if (this.statusCode === 200 || this.statusCode == null) {
                    this.setState({ statusCode: res.status });
                }
                this.setState({ scouting: res.data });
            }).catch(err => console.error(err));

            axios.get(`/api/team/v1/games/latest/name/${params.teamName}`)
            .then((res) => {
                if (this.statusCode === 200 || this.statusCode == null) {
                    this.setState({ statusCode: res.status });
                }
                this.setState({ games: res.data });
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

        axios.get(`/api/team/v1/information/name/${params.teamName}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ info: res.data });
        }).catch(err => console.error(err));

        if (params.tournamentShortName) {
            // Specific tournament
            axios.get(`/api/team/v1/stats/name/${params.teamName}/${params.tournamentShortName}`)
            .then((res) => {
                if (this.statusCode === 200 || this.statusCode == null) {
                    this.setState({ statusCode: res.status });
                }
                this.setState({ stats: res.data });
            }).catch(err => console.error(err));
        }
        else {
            // Latest tournament
            axios.get(`/api/team/v1/stats/latest/name/${params.teamName}`)
            .then((res) => {
                if (this.statusCode === 200 || this.statusCode == null) {
                    this.setState({ statusCode: res.status });
                }
                this.setState({ stats: res.data });
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
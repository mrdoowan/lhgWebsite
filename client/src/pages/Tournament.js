import React, { Component } from 'react';
import axios from 'axios';
// Components
import Markup from '../components/Markup';
import Error from '../components/ErrorComponent';
// Util
import TourneyBaseSkeleton from '../util/Tournament/TourneyBaseSkeleton';
import TourneyTeamsSkeleton from '../util/Tournament/TourneyTeamsSkeleton';
import TourneyPlayersSkeleton from '../util/Tournament/TourneyPlayersSkeleton';
import TourneyChampsSkeleton from '../util/Tournament/TourneyChampsSkeleton';
import TourneyGamesSkeleton from '../util/Tournament/TourneyGamesSkeleton';
// temporary
import TourneyUpdateTemporary from '../components/Tournament/TourneyUpdate';

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

        axios.get(`/api/tournament/v1/information/name/${params.tournamentShortName}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ info: res.data });
        }).catch(err => console.error(err));

        axios.get(`/api/tournament/v1/stats/name/${params.tournamentShortName}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ stats: res.data });
        }).catch(err => console.error(err));

        axios.get(`/api/tournament/v1/leaderboards/name/${params.tournamentShortName}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ leaderboards: res.data });
        }).catch(err => console.error(err));
    }

    render() {
        const { info, stats, leaderboards, statusCode } = this.state;

        let component = (<TourneyBaseSkeleton info={info} stats={stats} lb={leaderboards} />);

        return ((statusCode != null && statusCode !== 200) ? 
            (<Error code={statusCode} page="Tournament" />) :
            (<Markup data={info && stats && leaderboards} dataComponent={component} code={statusCode} />)
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

        axios.get(`/api/tournament/v1/information/name/${params.tournamentShortName}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ info: res.data });
        }).catch(err => console.error(err));

        axios.get(`/api/tournament/v1/players/name/${params.tournamentShortName}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ players: res.data });
        }).catch(err => console.error(err));
    }

    render() {
        const { info, players, statusCode } = this.state;

        let component = (<TourneyPlayersSkeleton info={info} players={players} />);

        return ((statusCode != null && statusCode !== 200) ? 
            (<Error code={statusCode} page="Tournament" />) :
            (<Markup data={info && players} dataComponent={component} code={statusCode} />)
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

        axios.get(`/api/tournament/v1/information/name/${params.tournamentShortName}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ info: res.data });
        }).catch(err => console.error(err));

        axios.get(`/api/tournament/v1/teams/name/${params.tournamentShortName}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ teams: res.data });
        }).catch(err => console.error(err));
    }

    render() {
        const { info, teams, statusCode } = this.state;

        let component = (<TourneyTeamsSkeleton info={info} teams={teams} />);

        return ((statusCode != null && statusCode !== 200) ? 
            (<Error code={statusCode} page="Tournament" />) :
            (<Markup data={info && teams} dataComponent={component} code={statusCode} />)
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

        axios.get(`/api/tournament/v1/information/name/${params.tournamentShortName}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ info: res.data });
        }).catch(err => console.error(err));

        axios.get(`/api/tournament/v1/pickbans/name/${params.tournamentShortName}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ pickBans: res.data });
        }).catch(err => console.error(err));
    }

    render() {
        const { info, pickBans, statusCode } = this.state;

        let component = (<TourneyChampsSkeleton info={info} pb={pickBans} />);

        return ((statusCode != null && statusCode !== 200) ? 
            (<Error code={statusCode} page="Tournament" />) :
            (<Markup data={info && pickBans} dataComponent={component} code={statusCode} />)
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

        axios.get(`/api/tournament/v1/information/name/${params.tournamentShortName}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ info: res.data });
        }).catch(err => console.error(err));

        axios.get(`/api/tournament/v1/games/name/${params.tournamentShortName}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ games: res.data });
        }).catch(err => console.error(err));
    }

    render() {
        const { info, games, statusCode } = this.state;

        let component = (<TourneyGamesSkeleton info={info} games={games} />);

        return ((statusCode != null && statusCode !== 200) ? 
            (<Error code={statusCode} page="Tournament" />) :
            (<Markup data={info && games} dataComponent={component} code={statusCode} />)
        )
    }
}

// {MAIN}/tournament/:tournamentShortName/games
export class tournamentUpdate extends Component {
    state = {
        info: null,
        statusCode: null,
        errors: {},
        loading: false,
        response: null,
    }
    
    componentDidMount() {
        const { match: { params } } = this.props;

        axios.get(`/api/tournament/v1/information/name/${params.tournamentShortName}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ info: res.data });
        }).catch(err => console.error(err));
    }

    handleSubmit = (event) => {
        const { match: { params } } = this.props;

        event.preventDefault();
        this.setState({
            errors: {},
            response: null,
            loading: true,
        });
        const body = {
            tournamentShortName: params.tournamentShortName
        }

        axios.put('/api/tournament/v1/update', body)
        .then((res) => {
            this.setState({
                response: res.data,
                loading: false,
            })
        })
        .catch((err) => {
            this.setState({
                errors: err,
                loading: false,
            })
        })
    }

    render() {
        const { info, statusCode, loading, response } = this.state;

        let component = (<TourneyUpdateTemporary 
            info={info} 
            handleSubmit={this.handleSubmit}
            loading={loading}
            response={response}
        />);

        return ((statusCode != null && statusCode !== 200) ? 
            (<Error code={statusCode} page="Tournament" />) : 
            (<Markup data={info} dataComponent={component} code={statusCode} />)
        )
    }
}
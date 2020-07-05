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
        }).catch((err) => {
            this.setState({ statusCode: err.response.status })
        });

        axios.get(`/api/tournament/v1/stats/name/${params.tournamentShortName}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ stats: res.data });
        }).catch((err) => {
            this.setState({ statusCode: err.response.status })
        });

        axios.get(`/api/tournament/v1/leaderboards/name/${params.tournamentShortName}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ leaderboards: res.data });
        }).catch((err) => {
            this.setState({ statusCode: err.response.status })
        });
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
        }).catch((err) => {
            this.setState({ statusCode: err.response.status })
        });

        axios.get(`/api/tournament/v1/players/stats/name/${params.tournamentShortName}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ players: res.data });
        }).catch((err) => {
            this.setState({ statusCode: err.response.status })
        });
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
        }).catch((err) => {
            this.setState({ statusCode: err.response.status })
        });

        axios.get(`/api/tournament/v1/teams/stats/name/${params.tournamentShortName}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ teams: res.data });
        }).catch((err) => {
            this.setState({ statusCode: err.response.status })
        });
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
        }).catch((err) => {
            this.setState({ statusCode: err.response.status })
        });

        axios.get(`/api/tournament/v1/pickbans/name/${params.tournamentShortName}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ pickBans: res.data });
        }).catch((err) => {
            this.setState({ statusCode: err.response.status })
        });
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
        }).catch((err) => {
            this.setState({ statusCode: err.response.status })
        });

        axios.get(`/api/tournament/v1/games/name/${params.tournamentShortName}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ games: res.data });
        }).catch((err) => {
            this.setState({ statusCode: err.response.status })
        });
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
        playersNum: null,
        teamsNum: null,
        gamesNum: null,
        loading: false,
    }
    
    componentDidMount() {
        const { match: { params } } = this.props;

        axios.get(`/api/tournament/v1/information/name/${params.tournamentShortName}`)
        .then((res) => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            this.setState({ info: res.data });
        }).catch((err) => {
            this.setState({ statusCode: err.response.status })
        });
    }

    allUpdated() {
        const ret = (
            (this.state.playersNum) &&
            (this.state.teamsNum) &&
            (this.state.gamesNum)
        );
        return (ret) ? true : false;
    }

    handleSubmit = (event) => {
        const { match: { params } } = this.props;
        event.preventDefault();
        this.setState({
            response: null,
            loading: true,
        });

        // Do multiple PUT requests to update each Player
        axios.get(`/api/tournament/v1/players/ids/name/${params.tournamentShortName}`)
        .then(async (res) => {
            const playerList = res.data;
            let success = true;

            for (let i = 0; i < playerList.length; ++i) {
                const playerPId = playerList[i];
                const body = {
                    tournamentShortName: params.tournamentShortName,
                    playerPId: playerPId,
                }
                await axios.put('/api/tournament/v1/update/player', body)
                // eslint-disable-next-line
                .catch((err) => {
                    console.error(err);
                    this.setState({
                        statusCode: err.response.status,
                        response: null,
                        loading: false,
                    });
                    i = playerList.length; // Super jank
                    success = false;
                });
            }
            if (success) {
                this.setState({ 
                    statusCode: res.status,
                    playersNum: playerList.length,
                });
                this.setState({ loading: !(this.allUpdated()) });
            }
        }).catch((err) => {
            console.error(err);
            this.setState({
                statusCode: err.response.status,
                response: null,
                loading: false,
            });
        });

        // Do multiple PUT requests to update each Team
        axios.get(`/api/tournament/v1/teams/ids/name/${params.tournamentShortName}`)
        .then(async (res) => {
            const teamList = res.data;
            let success = true;
            for (let i = 0; i < teamList.length; ++i) {
                const teamPId = teamList[i];
                const body = {
                    tournamentShortName: params.tournamentShortName,
                    teamPId: teamPId,
                }
                await axios.put('/api/tournament/v1/update/team', body)
                // eslint-disable-next-line
                .catch((err) => {
                    console.error(err);
                    this.setState({
                        statusCode: err.response.status,
                        response: null,
                        loading: false,
                    });
                    i = teamList.length; // Super jank
                    success = false;
                });
            }
            if (success) {
                this.setState({
                    statusCode: res.status,
                    teamsNum: teamList.length,
                });
                this.setState({ loading: !(this.allUpdated()) })
            }
        }).catch((err) => {
            console.error(err);
            this.setState({
                statusCode: err.response.status,
                response: null,
                loading: false,
            });
        });

        // PUT request to update all games
        axios.put('/api/tournament/v1/update/overall', {
            tournamentShortName: params.tournamentShortName,
        })
        .then((res) => {
            this.setState({
                statusCode: res.status,
                gamesNum: res.data.gamesNum,
            });
            this.setState({ loading: !(this.allUpdated()) });
        })
        .catch((err) => { 
            console.error(err); 
            this.setState({
                statusCode: err.response.status,
                response: null,
                loading: false,
            })
        });
    }

    render() {
        const { info, statusCode, loading, playersNum, teamsNum, gamesNum } = this.state;
        
        const response = (playersNum || teamsNum || gamesNum) ? ({
            playersNum: playersNum,
            teamsNum: teamsNum,
            gamesNum: gamesNum,
        }) : null;

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
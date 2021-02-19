import React, { Component, useState, useEffect } from 'react';
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
// Direct Component
import TourneyUpdate from '../components/Tournament/TourneyUpdate';

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
export const TournamentUpdatePage = (props) => {
    // Init state
    const [infoData, setInfoData] = useState({});
    const [statusCode, setStatusCode] = useState(null);
    const [playerNumber, setPlayerNumber] = useState(null);
    const [teamNumber, setTeamNumber] = useState(null);
    const [gameNumber, setGameNumber] = useState(null);
    const [loading, setLoading] = useState(false);
    const { match: { params } } = props;

    // Mount Component
    useEffect(() => {
        axios.get(`/api/tournament/v1/information/name/${params.tournamentShortName}`)
        .then((res) => {
            setStatusCode(res.status);
            setInfoData(res.data);
        }).catch((err) => {
            setStatusCode(err.response.status);
        })
    }, [params]);

    /**
     * Check if all numbers have values
     * @returns {boolean}
     */
    const isAllUpdated = () => {
        return (playerNumber && teamNumber && gameNumber);
    }

    const handleTournamentUpdate = (event) => {
        event.preventDefault();
        setPlayerNumber(null);
        setTeamNumber(null);
        setGameNumber(null);
        setLoading(true);

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
                    setStatusCode(err.response.status);
                    setLoading(false);
                    setPlayerNumber(null);
                    i = playerList.length; // Super jank
                    success = false;
                });
            }
            if (success) {
                setStatusCode(res.status);
                setPlayerNumber(playerList.length);
                setLoading(!isAllUpdated());
            }
        }).catch((err) => {
            console.error(err);
            setStatusCode(err.response.status);
            setPlayerNumber(null);
            setLoading(false);
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
                    setStatusCode(err.response.status);
                    setLoading(false);
                    setTeamNumber(null);
                    i = teamList.length; // Super jank
                    success = false;
                });
            }
            if (success) {
                setStatusCode(res.status);
                setTeamNumber(teamList.length);
                setLoading(!isAllUpdated());
            }
        }).catch((err) => {
            console.error(err);
            setStatusCode(err.response.status);
            setTeamNumber(null);
            setLoading(false);
        });

        // PUT request to update all games
        axios.put('/api/tournament/v1/update/overall', {
            tournamentShortName: params.tournamentShortName,
        }).then((res) => {
            setStatusCode(res.status);
            setGameNumber(res.data.gamesNum);
            setLoading(!isAllUpdated());
        }).catch((err) => { 
            console.error(err); 
            setStatusCode(err.response.status);
            setGameNumber(null);
            setLoading(false);
        });
    }

    const tournamentUpdateComponent = <TourneyUpdate
        infoData={infoData}
        loading={loading}
        playerNumber={playerNumber}
        teamNumber={teamNumber}
        gameNumber={gameNumber}
        handleUpdateTournament={handleTournamentUpdate}
    />
    
    return (
        (statusCode !== 200 && !statusCode) ? 
        (<Error code={statusCode} page="Tournament" />) : 
        (<Markup 
            data={infoData}
            dataComponent={tournamentUpdateComponent} 
            code={statusCode} 
        />)
    );
}

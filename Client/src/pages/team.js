import React, { Component } from 'react';

// If teamName is not in the database, redirect to 404 - FUNCTION HERE

//  - ADDITIONAL TEAM RENDER HERE

// {MAIN}/team/:teamName
export class teamBase extends Component {
    state = {
        info: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;

        fetch('/api/team/information/name/' + params.teamName)
        .then(res => res.json())
        .then(data => {
            this.setState({
                info: data
            });
        })
        .catch(err => console.error(err));
    }

    render() {
        console.log(this.state);
        const { info } = this.state;

        return (
            <div>
                
            </div>
        )
    }
}

// {MAIN}/team/:teamName/games/:seasonShortName
export class teamGames extends Component {
    state = {
        info: null,
        scouting: null,
        games: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;

        fetch('/api/team/information/name/' + params.teamName)
        .then(res => res.json())
        .then(data => {
            this.setState({
                info: data
            });
        })
        .catch(err => console.error(err));

        fetch('/api/team/scouting/name/' + params.teamName + '/' + params.seasonShortName)
        .then(res => res.json())
        .then(data => {
            this.setState({
                scouting: data
            });
        })
        .catch(err => console.error(err));

        fetch('/api/team/games/name/' + params.teamName + '/' + params.seasonShortName)
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
                
            </div>
        )
    }
}

// {MAIN}/team/:teamName/stats/:tournamentShortName
export class teamStats extends Component {
    state = {
        info: null,
        stats: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;

        fetch('/api/team/information/name/' + params.teamName)
        .then(res => res.json())
        .then(data => {
            this.setState({
                info: data
            });
        })
        .catch(err => console.error(err));

        fetch('/api/team/stats/name/' + params.teamName + '/' + params.seasonShortName)
        .then(res => res.json())
        .then(data => {
            this.setState({
                stats: data
            });
        })
        .catch(err => console.error(err));
    }

    render() {
        console.log(this.state);
        const { info } = this.state;

        return (
            <div>
                
            </div>
        )
    }
}
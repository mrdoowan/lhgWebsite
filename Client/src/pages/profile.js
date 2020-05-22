import React, { Component } from 'react';

// If profileName is not in the database, redirect to 404 - FUNCTION HERE

// {MAIN}/profile/:profileName
export class profileBase extends Component {
    state = {
        info: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;

        fetch('/api/profile/information/name/' + params.profileName)
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
        //const { info } = this.state;

        return (
            <div>
                
            </div>
        )
    }
}

// {MAIN}/profile/:profileName/games/:seasonShortName
export class profileGames extends Component {
    state = {
        info: null,
        games: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;

        fetch('/api/profile/information/name/' + params.profileName)
        .then(res => res.json())
        .then(data => {
            this.setState({
                info: data
            });
        })
        .catch(err => console.error(err));

        fetch('/api/profile/games/name/' + params.profileName + '/' + params.seasonShortName)
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
        //const { info } = this.state;

        return (
            <div>
                
            </div>
        )
    }
}

// {MAIN}/profile/:profileName/stats/:tournamentShortName
export class profileStats extends Component {
    state = {
        info: null,
        stats: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;

        fetch('/api/profile/information/name/' + params.profileName)
        .then(res => res.json())
        .then(data => {
            this.setState({
                info: data
            });
        })
        .catch(err => console.error(err));

        fetch('/api/profile/stats/name/' + params.profileName + '/' + params.seasonShortName)
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
        //const { info } = this.state;

        return (
            <div>
                
            </div>
        )
    }
}
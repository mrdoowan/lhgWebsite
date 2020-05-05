import React, { Component } from 'react';
import './Basic.css';

// If riotMatchID is not in the database, redirect to 404 - FUNCTION HERE

//  - ADDITIONAL PLAYER RENDER HERE

// {MAIN}/match/:matchPId
export class MatchBase extends Component {
    state = {
        match: null
    }

    componentDidMount() {
        const { match: { params } } = this.props;
        fetch('/api/match/' + params.matchPId)
        .then(res => {
            this.setState({
                match: res.json()
            })
        })
        .catch(err => console.error(err));
    }

    render() {
        let matchIdMarkup = this.state.match ? (
            <p>Match Page for ID: {this.state.match.MatchPId}</p>
        ) : (
            <p>Loading...</p>
        )

        return (
            <div className="body">
                {matchIdMarkup}
            </div>
        );
    }
}
import React, { Component } from 'react';
import './Basic.css';

// If riotMatchID is not in the database, redirect to 404 - FUNCTION HERE

//  - ADDITIONAL PLAYER RENDER HERE

// {MAIN}/match/:matchPId
export class MatchBase extends Component {
    constructor() {
        super();
        this.state = {
            match: {}
        }
    }

    componentDidMount() {
        const { match: { params } } = this.props;
        fetch('/api/match/' + params.matchPId)
        .then(res => res.json())
        .then(match => {
            this.setState({ match });
            console.log(this.state);
        });
    }

    render() {
        return (
            <div className="body">
                <p>Match Page for ID: {this.state.match.MatchPId}</p>
            </div>
        );
    }
}
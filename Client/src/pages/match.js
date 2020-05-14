import React, { Component } from 'react';

// If riotMatchID is not in the database, redirect to 404 - FUNCTION HERE

//  - ADDITIONAL PLAYER RENDER HERE

// {MAIN}/match/:matchPId
export class matchBase extends Component {
    state = {
        match: null
    }

    componentDidMount() {
        const { match: { params } } = this.props;
        fetch('/api/match/' + params.matchPId)
        .then(res => res.json())
        .then(data => {
            this.setState({
                match: data
            });
        })
        .catch(err => console.error(err));
    }

    render() {
        const { match } = this.state;
        let matchIdMarkup = match ? (
            <div className="body">
                <p>Match Page for ID: {match.MatchPId}</p>
            </div>
        ) : ( <div></div> );

        return (
            <div>
                {matchIdMarkup}
            </div>
        );
    }
}
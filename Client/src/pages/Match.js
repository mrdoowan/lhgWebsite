import React, { Component } from 'react';

// If riotMatchID is not in the database, redirect to 404 - FUNCTION HERE

//  - ADDITIONAL PLAYER RENDER HERE

// {MAIN}/match/:matchPId
export class matchBase extends Component {
    state = {
        match: null,
        statusCode: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;
        fetch('/api/match/' + params.matchPId)
        .then(res => {
            this.setState({
                statusCode: res.status
            });
            res.json().then((data) => {
                this.setState({ 
                    match: data
                });
            });
        })
        .catch(err => console.error(err));
    }

    render() {
        const { match, statusCode } = this.state;
        let matchIdMarkup = (
            <div className="body">
                <p>Match Page for ID: {match.MatchPId}</p>
            </div>
        );

        return ((statusCode != null && statusCode !== 200) ? 
            (<Error code={statusCode} page="Tournament" />) :
            (<Markup data={match} component={matchIdMarkup} code={statusCode} />)
        );
    }
}
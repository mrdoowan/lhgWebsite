import React, { Component } from 'react';
// Components
import Markup from '../components/Markup';
import Error from '../components/ErrorComponent';

// {MAIN}/match/:matchPId
export class matchBase extends Component {
    state = {
        match: null,
        statusCode: null,
    }

    componentDidMount() {
        const { match: { params } } = this.props;
        fetch('/api/match/v1/' + params.matchPId)
        .then(res => {
            if (this.statusCode === 200 || this.statusCode == null) {
                this.setState({ statusCode: res.status });
            }
            res.json().then((data) => {
                this.setState({ match: data });
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));
    }

    render() {
        const { match, statusCode } = this.state;

        let matchComponent = (match) ? (
            <div className="body">
                <p>Match Page for ID: {match.MatchPId}</p>
            </div>
        ) : (<div></div>);

        return ((statusCode != null && statusCode !== 200) ? 
            (<Error code={statusCode} page="Match" />) :
            (<Markup data={match} dataComponent={matchComponent} code={statusCode} />)
        );
    }
}
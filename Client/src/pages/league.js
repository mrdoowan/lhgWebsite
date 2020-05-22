import React, { Component } from 'react';
// Components
import LeagueTable from '../components/LeagueTable';

// {MAIN}/leagues
export class leagues extends Component {
    state = {
        leagues: null
    }

    componentDidMount() {
        fetch('/api/leagues/')
        .then(res => res.json())
        .then(data => {
            this.setState({ 
                leagues: data
            });
        })
        .catch(err => console.error(err));
    }

    render() {
        const { leagues } = this.state;

        return (
            <div>
                {leagues ? (
                    <LeagueTable seasonList={leagues} />
                ) : (
                    <div></div>
                )}
            </div>
        );
    }
}